//
// Copyright (c) 2019 by SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'
import keys from 'lodash/keys'
import values from 'lodash/values'
import SymbolTree from 'symbol-tree'
const uuidv4 = require('uuid/v4')

export class TreeItem {
  constructor ({ uuid = uuidv4(), data }) {
    this.uuid = uuid
    this.data = data
  }
}

export class SplitpaneTreeItem {
  constructor ({ horizontal }) {
    this.horizontal = horizontal
    this.splitpane = true
  }
}

export class GSymbolTree extends SymbolTree {
  constructor ({ description, horizontal = false } = {}) {
    super(description)

    this.itemMap = {}
    this.root = new SplitpaneTreeItem({ horizontal })
  }

  appendChild (referenceObject, newObject) {
    this._addToItemMap(newObject)

    super.appendChild(referenceObject, newObject)
  }

  prependChild (referenceObject, newObject) {
    this._addToItemMap(newObject)

    super.prependChild(referenceObject, newObject)
  }

  insertBefore (referenceObject, newObject) {
    this._addToItemMap(newObject)

    super.insertBefore(referenceObject, newObject)
  }

  insertAfter (referenceObject, newObject) {
    this._addToItemMap(newObject)

    super.insertAfter(referenceObject, newObject)
  }

  remove (removeObject, clean = true) {
    this._removeFromItemMap(removeObject)

    super.remove(removeObject)

    if (clean) {
      this._clean()
    }
  }

  lastChild (object, recursive = true) {
    if (!object) {
      return
    }
    const lastChild = super.lastChild(object)
    if (!recursive) {
      return lastChild
    }

    return this.lastChild(lastChild, recursive) || lastChild
  }

  items () {
    return values(this.itemMap)
  }

  keys () {
    return keys(this.itemMap)
  }

  isEmpty () {
    return isEmpty(this.itemMap)
  }

  moveTo ({ sourceId, targetId, position }) {
    if (!targetId || !sourceId) {
      return false
    }

    const targetItem = this.itemMap[targetId]
    const sourceItem = this.itemMap[sourceId]
    if (!targetItem || !sourceItem) {
      return false
    }

    return this._moveItemToAndClean({ sourceItem, targetItem, position })
  }

  removeWithIds (ids) {
    forEach(ids, id => this.removeWithId(id, false))

    this._clean()
  }

  removeWithId (id, clean = true) {
    const item = this.itemMap[id]
    if (!item) {
      return
    }

    this.remove(item, clean)
  }

  toItemTree (parent = this.root) {
    const clonedParent = cloneDeep(parent)
    if (!this.hasChildren(parent)) {
      return undefined
    }
    const items = []
    for (const child of this.childrenIterator(parent)) {
      if (child instanceof SplitpaneTreeItem) {
        items.push(this.toItemTree(child))
      } else {
        items.push(cloneDeep(child))
      }
    }
    clonedParent.items = items
    return clonedParent
  }

  static fromItemTree (itemTree) {
    const tree = new GSymbolTree({ horizontal: itemTree.horizontal })
    tree._addTreeItems({ items: itemTree.items })
    return tree
  }

  _addToItemMap (newItem) {
    if (newItem instanceof TreeItem) {
      const key = newItem.uuid
      Vue.set(this.itemMap, key, newItem)
    }
  }

  _removeFromItemMap (removeObject) {
    if (removeObject instanceof TreeItem) {
      const key = removeObject.uuid
      Vue.delete(this.itemMap, key)
    }
  }

  _moveItemToAndClean ({ sourceItem, targetItem, position }) {
    const res = this._moveItemTo({ sourceItem, targetItem, position })
    this._clean()

    return res
  }

  _moveItemTo ({ sourceItem, targetItem, position }) {
    const targetParent = this.parent(targetItem)
    this.remove(sourceItem)
    switch (position) {
      case 'top': {
        this._ensureSplitpaneOrientation({ horizontal: true, targetParent, targetItem })
        this.insertBefore(targetItem, sourceItem)
        return true
      }
      case 'bottom': {
        this._ensureSplitpaneOrientation({ horizontal: true, targetParent, targetItem })
        this.insertAfter(targetItem, sourceItem)
        return true
      }
      case 'left': {
        this._ensureSplitpaneOrientation({ horizontal: false, targetParent, targetItem })
        this.insertBefore(targetItem, sourceItem)
        return true
      }
      case 'right': {
        this._ensureSplitpaneOrientation({ horizontal: false, targetParent, targetItem })
        this.insertAfter(targetItem, sourceItem)
        return true
      }
    }
    return false
  }

  /*
    _clean should be called when items are removed from the tree or moved to a different parent.
  */
  _clean (parent = this.root) {
    if (this.root !== parent) {
      if (this.childrenCount(parent) === 1) {
        const onlyChild = this.firstChild(parent)
        this.remove(onlyChild)
        this.insertBefore(parent, onlyChild)
        this.remove(parent)
      }
    }
    for (const child of this.childrenIterator(parent)) {
      this._clean(child)
    }
  }

  _ensureSplitpaneOrientation ({ horizontal, targetParent, targetItem }) {
    if (targetParent.horizontal === horizontal) {
      return
    }
    if (this.childrenCount(targetParent) === 1) {
      targetParent.horizontal = horizontal
      return
    }

    // set new splitpane with desired orientation at the position of the targetItem and place target item under new splitpane
    const splitpane = new SplitpaneTreeItem({ horizontal })
    this.insertBefore(targetItem, splitpane)
    targetParent = splitpane

    this.remove(targetItem)
    this.prependChild(targetParent, targetItem)
  }

  _addTreeItems ({ parent = this.root, items }) {
    if (items) {
      items.forEach(item => {
        const items = item.items
        if (items) {
          const splitpaneTreeItem = new SplitpaneTreeItem({ horizontal: item.horizontal })
          this.appendChild(parent, splitpaneTreeItem)
          this._addTreeItems({ parent: splitpaneTreeItem, items }) // recursion
        } else {
          this.appendChild(parent, new TreeItem({ uuid: item.uuid, data: item.data }))
        }
      })
    }
    this._clean()
  }
}
