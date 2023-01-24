//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

'use strict'

const EventEmitter = require('events')
const _ = require('lodash')
const logger = require('../lib/logger')
const config = require('../lib/config')
const watches = require('../lib/watches')
const cache = require('../lib/cache')
const tickets = require('../lib/services/tickets')

const rooms = new Map()

function getRoom (name) {
  if (!rooms.has(name)) {
    rooms.set(name, {
      emit: jest.fn()
    })
  }
  return rooms.get(name)
}

const nsp = {
  to: jest.fn().mockImplementation(name => {
    if (Array.isArray(name)) {
      return {
        rooms: name.map(getRoom),
        emit (...args) {
          for (const room of this.rooms) {
            room.emit(...args)
          }
        }
      }
    }
    return getRoom(name)
  }),
  emit: jest.fn()
}

const io = {
  of: jest.fn().mockReturnValue(nsp)
}

describe('watches', function () {
  const foobar = { metadata: { namespace: 'foo', name: 'bar', uid: 4 } }
  const foobaz = { metadata: { namespace: 'foo', name: 'baz', uid: 5 } }
  const projectList = [
    {
      metadata: { name: 'foo' },
      spec: {
        namespace: 'foo'
      }
    },
    {
      metadata: { name: 'bar' },
      spec: {
        namespace: 'bar'
      }
    }
  ]

  let informer

  beforeEach(function () {
    informer = new EventEmitter()
    rooms.clear()
    jest.clearAllMocks()
  })

  describe('shoots', function () {
    const foobarUnhealthy = _
      .chain(foobar)
      .cloneDeep()
      .set('metadata.labels["shoot.gardener.cloud/status"]', 'unhealthy')
      .value()

    const foobazUnhealthy = _
      .chain(foobaz)
      .cloneDeep()
      .set('metadata.labels["shoot.gardener.cloud/status"]', 'unhealthy')
      .value()

    let shootsWithIssues

    let deleteTicketsStub
    let findProjectByNamespaceStub

    beforeEach(() => {
      shootsWithIssues = new Set()
      deleteTicketsStub = jest.spyOn(tickets, 'deleteTickets')
      findProjectByNamespaceStub = jest.spyOn(cache, 'findProjectByNamespace').mockImplementation(namespace => {
        return _.find(projectList, ['spec.namespace', namespace])
      })
    })

    it('should watch shoots without issues', async function () {
      watches.shoots(io, informer)

      expect(io.of).toBeCalledTimes(1)
      expect(io.of.mock.calls).toEqual([['/']])

      informer.emit('add', foobar)
      informer.emit('update', foobar)
      informer.emit('delete', foobar)

      expect(logger.error).not.toBeCalled()
      expect(deleteTicketsStub).toBeCalledTimes(1)
      expect(findProjectByNamespaceStub).toBeCalledTimes(1)
      expect(findProjectByNamespaceStub.mock.calls).toEqual([['foo']])

      const keys = ['shoots:admin', 'shoots;foo', 'shoots;foo/bar']
      expect(nsp.to).toBeCalledTimes(3)
      expect(nsp.to.mock.calls).toEqual([[keys], [keys], [keys]])
      expect(Array.from(rooms.keys())).toEqual(keys)
      for (const key of keys) {
        const room = rooms.get(key)
        expect(room.emit).toBeCalledTimes(3)
        expect(room.emit.mock.calls).toEqual([
          [
            'shoots',
            { type: 'ADDED', object: foobar }
          ],
          [
            'shoots',
            { type: 'MODIFIED', object: foobar }
          ],
          [
            'shoots',
            { type: 'DELETED', object: foobar }
          ]
        ])
      }
    })

    it('should watch shoots with issues', async function () {
      watches.shoots(io, informer, { shootsWithIssues })

      expect(shootsWithIssues).toHaveProperty('size', 0)
      informer.emit('add', foobarUnhealthy)
      expect(shootsWithIssues).toHaveProperty('size', 1)
      informer.emit('update', foobar)
      expect(shootsWithIssues).toHaveProperty('size', 0)
      informer.emit('add', foobazUnhealthy)
      expect(shootsWithIssues).toHaveProperty('size', 1)
      informer.emit('update', foobazUnhealthy)
      expect(shootsWithIssues).toHaveProperty('size', 1)
      informer.emit('delete', foobazUnhealthy)
      expect(shootsWithIssues).toHaveProperty('size', 0)

      expect(deleteTicketsStub).toBeCalledTimes(1)

      const fooRoom = rooms.get('shoots;foo')
      expect(fooRoom.emit).toBeCalledTimes(5)
      const fooIssuesRoom = rooms.get('shoots:unhealthy;foo')
      expect(fooIssuesRoom.emit).toBeCalledTimes(5)
      expect(fooIssuesRoom.emit.mock.calls).toEqual([
        [
          'shoots',
          { type: 'ADDED', object: foobarUnhealthy }
        ],
        [
          'shoots',
          { type: 'DELETED', object: foobar }
        ],
        [
          'shoots',
          { type: 'ADDED', object: foobazUnhealthy }
        ],
        [
          'shoots',
          { type: 'MODIFIED', object: foobazUnhealthy }
        ],
        [
          'shoots',
          { type: 'DELETED', object: foobazUnhealthy }
        ]
      ])
    })

    it('should delete tickets for a deleted shoot', async function () {
      deleteTicketsStub.mockImplementation(({ projectName, name }) => {
        const namespace = _.find(projectList, ['metadata.name', projectName]).spec.namespace
        if (namespace === 'foo' && name === 'baz') {
          throw new Error('TicketError')
        }
      })

      watches.shoots(io, informer)

      informer.emit('delete', foobar)
      informer.emit('delete', foobaz)

      expect(logger.error).toBeCalledTimes(1)
      expect(deleteTicketsStub).toBeCalledTimes(2)
    })
  })

  describe('tickets', function () {
    const metadata = {
      projectName: 'foo',
      name: 'bar'
    }
    const issueEvent = { object: { metadata } }
    const commentEvent = { object: { metadata } }

    const ticketCache = {
      on (eventName, handler) {
        switch (eventName) {
          case 'issue':
            handler(issueEvent)
            break
          case 'comment':
            handler(commentEvent)
            break
        }
      }
    }

    const gitHubConfig = config.gitHub

    let gitHubStub
    let loadOpenIssuesStub
    let abortController
    let signalAddEventListenerStub

    beforeEach(function () {
      gitHubStub = jest.fn()
      Object.defineProperty(config, 'gitHub', { get: gitHubStub })
      ticketCache.getIssueNumbers = jest.fn()
      ticketCache.getIssueNumbers.mockReturnValue([])
      loadOpenIssuesStub = jest.spyOn(tickets, 'loadOpenIssues').mockResolvedValue([])
      jest.clearAllMocks()

      abortController = new AbortController()
      signalAddEventListenerStub = jest.spyOn(abortController.signal, 'addEventListener')
    })

    afterEach(function () {
      Object.defineProperty(config, 'gitHub', { value: gitHubConfig })
    })

    it('should log a warning if gitHub config is missing and not continue', async function () {
      jest.spyOn(ticketCache, 'on')
      gitHubStub.mockReturnValue(false)
      watches.tickets(io, informer, ticketCache, abortController.signal)
      expect(logger.warn).toBeCalledTimes(1)
      expect(ticketCache.on).toBeCalledTimes(0)
    })

    it('should poll tickets in a given interval', async function () {
      gitHubStub.mockReturnValue({
        pollIntervalSeconds: 1
      })

      jest.useFakeTimers()
      jest.spyOn(global, 'setInterval')

      await watches.tickets(io, informer, ticketCache, abortController.signal)

      expect(setInterval).toBeCalledTimes(1)
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000)
      expect(loadOpenIssuesStub).toBeCalledTimes(1)

      jest.advanceTimersByTime(1_000)

      expect(loadOpenIssuesStub).toBeCalledTimes(2)
    })

    it('should poll tickets when kubernetes lease object is updated', async function () {
      gitHubStub.mockReturnValue({
        webhookSecret: 'secret'
      })
      ticketCache.getIssueNumbers = jest.fn().mockReturnValue([])
      jest.spyOn(informer, 'on')

      await watches.tickets(io, informer, ticketCache, abortController.signal)
      expect(loadOpenIssuesStub).toBeCalledTimes(1)
      expect(informer.on).toBeCalledTimes(1)

      informer.emit('update')
      expect(loadOpenIssuesStub).toBeCalledTimes(2)
    })

    it('should cleanup when abort is triggered', async function () {
      gitHubStub.mockReturnValue({
        pollThrottleSeconds: 0,
        pollIntervalSeconds: 10,
        webhookSecret: 'secret'
      })

      jest.useFakeTimers()
      jest.spyOn(global, 'clearInterval')
      jest.spyOn(informer, 'removeListener')

      await watches.tickets(io, informer, ticketCache, abortController.signal)

      expect(signalAddEventListenerStub).toHaveBeenCalledWith('abort', expect.any(Function), { once: true })

      abortController.abort()

      expect(clearInterval).toBeCalledTimes(1)
      expect(informer.removeListener).toBeCalledTimes(1)
    })

    it('should listen to ticketCache events', async function () {
      gitHubStub.mockReturnValue({
        pollThrottleSeconds: 0
      })
      jest.spyOn(ticketCache, 'on')

      await watches.tickets(io, informer, ticketCache, abortController.signal)

      expect(ticketCache.on).toHaveBeenCalledWith('issue', expect.any(Function))
      expect(nsp.emit).toHaveBeenCalledWith('issues', issueEvent)
      expect(ticketCache.on).toHaveBeenCalledWith('comment', expect.any(Function))
      expect(nsp.to).toHaveBeenCalledWith([`shoots;garden-foo/${metadata.name}`])
    })

    it('should log error if ticket fetching fails', async function () {
      gitHubStub.mockReturnValue({
        webhookSecret: 'secret'
      })
      loadOpenIssuesStub.mockRejectedValueOnce(new Error('Unexpected'))
      ticketCache.getIssueNumbers = jest.fn().mockReturnValue([])

      await watches.tickets(io, informer, ticketCache, abortController.signal)

      expect(loadOpenIssuesStub).toBeCalledTimes(1)
      expect(logger.error).toBeCalledTimes(1)
    })
  })
})
