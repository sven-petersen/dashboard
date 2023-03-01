//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import colors from 'vuetify/lib/util/colors'

const light = {
  dark: false,
  colors: {
    primary: '#0b8062',
    anchor: '#0b8062',
    'main-background': colors.grey.darken3,
    'main-navigation-title': colors.shades.white,
    'toolbar-background': '#0b8062',
    'toolbar-title': colors.shades.white,
    'action-button': colors.grey.darken4
  }
}

const dark = {
  dark: true,
  colors: {
    primary: '#0b8062',
    anchor: '#0b8062',
    'main-background': colors.grey.darken3,
    'main-navigation-title': colors.shades.white,
    'toolbar-background': '#0b8062',
    'toolbar-title': colors.shades.white,
    'action-button': colors.grey.lighten4,
    error: colors.red.darken4,
    warning: colors.orange.darken4
  }
}

const theme = {
  themes: { light, dark },
  variations: {
    colors: ['primary', 'secondary', 'main-background'],
    lighten: 2,
    darken: 2,
  }
}

export default theme
