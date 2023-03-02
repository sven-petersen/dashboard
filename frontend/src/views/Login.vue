<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->

<template>
  <v-app>
    <div class="login-background bg-main-background" />
    <v-main>
      <v-container
        class="fill-height"
        fluid
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            sm="8"
            md="4"
            lg="4"
          >
            <v-card class="elevation-1">
              <v-card class="elevation-1">
                <v-card-title class="pa-0 d-flex flex-column">
                  <div class="d-flex flex-column align-center bg-main-background-darken-1 text-primary pa-3 pt-6">
                    <img
                      src="/static/assets/logo.svg"
                      alt="Login to Gardener"
                      width="180"
                      height="180"
                    >
                    <div class="flex my-4 text-primary text-h5 font-weight-light title-text">
                      Universal Kubernetes at Scale
                    </div>
                  </div>
                  <v-tabs
                    v-show="!loading"
                    v-model="loginType"
                    align-tabs="center"
                    color="primary"
                  >
                    <v-tab
                      v-for="item in cfg.loginTypes"
                      :key="item"
                      :href="`#${item}`"
                      :value="item"
                    >
                      {{ item }}
                    </v-tab>
                  </v-tabs>
                </v-card-title>
                <v-card-text class="login-form py-0">
                  <!-- FIXME: v-skeleton-loader does not exist in Vuetify3 (yet?) -->
                  <!-- <v-skeleton-loader
                        v-show="loading"
                        width="100%"
                        type="card"
                      ></v-skeleton-loader> -->
                  <v-window
                    v-show="!loading"
                    v-model="loginType"
                    class="px-3"
                  >
                    <v-window-item value="oidc">
                      <v-card
                        flat
                        class="foo"
                      >
                        <v-card-text>
                          <div class="text-subtitle-1 text-center">
                            Press Login to be redirected to configured<br> OpenID Connect Provider.
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-window-item>
                    <v-window-item
                      ref="tokenWindow"
                      value="token"
                    >
                      <v-card flat>
                        <v-card-text>
                          <div class="text-subtitle-1 text-center pb-3">
                            Enter a bearer token trusted by the Kubernetes API server and press Login.
                          </div>
                          <v-text-field
                            ref="token"
                            v-model="token"
                            color="primary"
                            :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showToken ? 'text' : 'password'"
                            variant="outlined"
                            label="Token"
                            required
                            @click:append="showToken = !showToken"
                          />
                        </v-card-text>
                      </v-card>
                    </v-window-item>
                  </v-window>
                </v-card-text>
                <v-card-actions
                  v-show="!loading"
                  class="bt-2 pb-4"
                >
                  <div class="d-flex justify-center flex-grow-1">
                    <v-btn
                      variant="elevated"
                      color="primary"
                      @click="handleLogin"
                    >
                      Login
                    </v-btn>
                  </div>
                </v-card-actions>
              </v-card>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <div
        v-if="landingPageUrl"
        class="footer text-caption"
      >
        <span class="text-primary">Discover what our service is about at the <a
          :href="landingPageUrl"
          target="_blank"
          rel="noopener"
        >Gardener Landing Page</a></span>
      </div>
    </v-main>
    <!-- FIXME: throws an error when included -->
    <g-snotify />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import { SnotifyPosition } from 'vue-snotify'
import get from 'lodash/get'
import head from 'lodash/head'
import { setDelayedInputFocus } from '@/utils'
import GSnotify from '@/components/GSnotify.vue'

function getPrimaryLoginType (cfg) {
  return head(cfg?.loginTypes) || 'oidc'
}

function getRedirectPath (route) {
  return get(route.query, 'redirectPath', '/')
}


export default {
  components: {
    GSnotify
  },
  beforeRouteEnter (to, from, next) {
    // FIXME: The Vue global object no longer exists/holds the api auth etc.
    //   Also, in the beforeRouteEnter, we do not have access to the component
    //   instance (no "this") or a way to get the "app"-instance.
    //   So this logic below needs to be rewritten or placed somewhere else.
    const guard = async (/* { api, auth, localStorage, logger } */) => {
      let err
      if (/^#.+/.test(to.hash)) {
        const searchParams = new URLSearchParams(to.hash.substring(1))
        if (searchParams.has('error')) {
          err = new Error(searchParams.get('error'))
        }
      }
      // let cfg
      // try {
      //   const { data } = await api.getLoginConfiguration()
      //   cfg = data
      // } catch (err) {
      // logger.error('Failed to fetch login configuration: %s', err.message)
      const cfg = {
        // loginTypes: ['token'] // at least allow the token login
        loginTypes: ['oidc', 'token'] // FIXME: temporary fix to allow login during migration
      }
      // }
      // const primaryLoginType = getPrimaryLoginType(cfg)
      // const autoLoginEnabled = localStorage.getItem('global/auto-login') === 'enabled'
      // if (!err && primaryLoginType === 'oidc' && autoLoginEnabled) {
      //   const redirectPath = get(to.query, 'redirectPath', '/')
      //   auth.signinWithOidc(redirectPath)
      //   return next(false)
      // }
      next(vm => {
        Object.assign(vm.cfg, cfg)
        if (err) {
          if (err.message !== 'NoAutoLogin') {
            vm.showSnotifyLoginError(err.message)
          }
          vm.$router.replace('/login')
        }
      })
    }
    guard(/* Vue */)
  },
  data () {
    return {
      dialog: false,
      showToken: false,
      token: '',
      loginType: undefined,
      cfg: {
        loginTypes: undefined,
        landingPageUrl: undefined
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters('storage', [
      'autoLoginEnabled'
    ]),
    redirectPath () {
      return getRedirectPath(this.$route)
    },
    primaryLoginType () {
      return getPrimaryLoginType(this.cfg)
    },
    landingPageUrl () {
      return this.cfg.landingPageUrl
    }
  },
  watch: {
    loginType (value) {
      if (value === 'token') {
        setDelayedInputFocus(this, 'token')
      }
    }
  },
  mounted () {
    this.loginType = this.primaryLoginType
  },
  methods: {
    handleLogin () {
      switch (this.loginType) {
        case 'oidc':
          this.oidcLogin()
          break
        case 'token':
          this.tokenLogin()
          break
      }
    },
    oidcLogin () {
      try {
        this.$auth.signinWithOidc(this.redirectPath)
      } catch (err) {
        this.showSnotifyLoginError(err.message)
      }
    },
    async tokenLogin () {
      try {
        const token = this.token
        this.token = undefined
        await this.$api.createTokenReview({ token })
        this.dialog = false
        try {
          await this.$router.push(this.redirectPath)
        } catch (err) {
          /* Catch and ignore navigation aborted errors. Redirection happens in navigation guards (see https://router.vuejs.org/guide/essentials/navigation.html#router-push-location-oncomplete-onabort). */
        }
      } catch (err) {
        this.dialog = false
        this.showSnotifyLoginError(err.message)
      }
    },
    showSnotifyLoginError (message) {
      const config = {
        position: SnotifyPosition.rightBottom,
        timeout: 5000,
        showProgressBar: false
      }
      this.$snotify.error(message, 'Login Error', config)
    }
  }
}
</script>

<style lang="scss" scoped>
  .login-background {
    height: 50%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  .login-form {
    min-height: 140px;
  }

  .footer {
    position: absolute;
    bottom: 10px;
    left: 0px;
    width: 100%;
    text-align: center;
  }

  .title-text {
    white-space: normal;
    word-break: break-word;
  }
</style>
