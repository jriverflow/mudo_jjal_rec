<template>
  <v-app>
    <v-app-bar>
        <v-container class="d-flex align-center py-0">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
          <router-link
          style="text-decoration: none; color: inherit;"
          to="/"
          >
            <v-app-bar-title>
              <div class="d-flex align-center outlined">
                <v-avatar
                rounded="0"
                class="mr-3"
                image="assets/images/mudori.svg"
                />
                  무도짤 추천
              </div>
            </v-app-bar-title>
          </router-link>
        </v-container>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
      <v-list nav>
        <router-link
          style="text-decoration: none; color: inherit;"
          to="/"
          >
          <v-list-item prepend-icon="mdi-view-dashboard" title="짤 검색창" value="home"></v-list-item>
        </router-link>
        <router-link
          style="text-decoration: none; color: inherit;"
          to="/release"
          >
          <v-list-item prepend-icon="mdi-alert-decagram" title="릴리즈 노트" value="release"></v-list-item>
        </router-link>
        <router-link
          style="text-decoration: none; color: inherit;"
          to="/about"
          >
          <v-list-item prepend-icon="mdi-forum" title="프로젝트 설명" value="about"></v-list-item>
        </router-link>
        <router-link
          style="text-decoration: none; color: inherit;"
          to="/people"
          >
          <v-list-item prepend-icon="mdi-account" title="만든 사람들" value="people"></v-list-item>
        </router-link>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-footer>
      <v-container class="text-overline d-flex align-center justify-space-between">
      <div>
          Copyright &copy;
      </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    name: 'App',
    data: () => ({
      drawer: false,
      group: null,
    }),
    watch: {
      group () {
        this.drawer = false
      },
    },
  }
</script>

<style>
.v-application {
  font-family: 'BaeMinJUA', sans-serif !important;
}
@font-face {
  font-family:'BaeMinJUA';
  src: url('assets/fonts/BMJUA_ttf.ttf') format('truetype');
  font-weight: 400;
}
</style>
