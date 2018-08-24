<template>
  <div class="">
    <div class="md-layout">
      <div class="md-layout">
        <div class="md-layout-item">
          <md-field>
            <label for="movie">Org / User</label>
            <md-select v-model="orgOrUser">
              <md-option value="orgs">org</md-option>
              <md-option value="users">user</md-option>
            </md-select>
          </md-field>
        </div>
        <div class="md-layout-item">
          <md-field>
            <label>Org Name</label>
            <md-input v-model="orgName"></md-input>
          </md-field>
        </div>

        <div class="md-layout-item">
          <md-field>
            <label>Username</label>
            <md-input v-model="username"></md-input>
          </md-field>
        </div>

        <div class="md-layout-item">
          <md-field>
            <label>Password or Token</label>
            <md-input type="password" v-model="password"></md-input>
          </md-field>
        </div>
      </div>
    </div>
    <div class="md-layout">
      <div class="md-layout-item">
        <md-content>
          <div v-for="(repo, i) in repo_list" :key="i" style="text-align:left; padding-left:10px;">
            <md-switch v-model="selected[i]" value="1">{{repo.full_name}}</md-switch>
          </div>

        </md-content>

      </div>
      <div class="md-layout-item">
        <md-content>
          <md-field>
            <label>Title</label>
            <md-input v-model="issue.title"></md-input>
          </md-field>
          <md-field>
            <label>Description</label>
            <md-textarea v-model="issue.body"></md-textarea>

          </md-field>
          <md-field>
            <label>Milestone</label>
            <md-input v-model="issue.milestone" type="number"></md-input>

          </md-field>
          <md-chips v-model="issue.labels" md-placeholder="Add labels..."></md-chips>

          <md-button :disabled="isSubmitting" class="md-raised md-primary" @click="addIssue()">Save</md-button>

        </md-content>
      </div>

    </div>
    <md-card v-for="(result, i) in results" :key="i">
      <md-card-media md-position="center" :md-duration="result.duration" md-active.sync="true">
       <md-icon v-if="result.hasOwnProperty('success')" :style="result.success ? 'color: green' : 'color:red'">{{result.success ? 'check' : 'clear'}}</md-icon> <span>{{result.message}}</span>
      </md-card-media>
    </md-card>
  </div>
</template>

<script>
export default {
  name: "",
  props: {
    msg: String
  },
  data() {
    return {
      orgsTimeout: false,
      repo_list: [],
      selected: {},
      issue: {
        title: "",
        body: "",
        labels: [],
        milestone: ""
      },
      isSubmitting: false,
      results: {}
    };
  },
  watch: {},
  computed: {
    saveRepos() {
      let repos = [];
      for (let i in this.selected) {
        if (this.selected[i]) {
          repos.push(this.repo_list[i]);
        }
      }
      return repos;
    },
    orgOrUser: {
      get() {
        return localStorage.getItem("orgOrUser") || "orgs";
      },
      set(val) {
        localStorage.setItem("orgOrUser", val);
        this.fetchRepos();
      }
    },
    orgName: {
      get() {
        return localStorage.getItem("orgName") || "";
      },
      set(val) {
        localStorage.setItem("orgName", val);
        this.fetchRepos();
      }
    },
    username: {
      get() {
        return localStorage.getItem("username") || "";
      },
      set(val) {
        localStorage.setItem("username", val);
      }
    },
    password: {
      get() {
        return localStorage.getItem("password") || "";
      },
      set(val) {
        localStorage.setItem("password", val);
      }
    }
  },
  methods: {
    addIssue() {
      this.$set(this, "results", {});
      this.isSubmitting = true;

      const auth = `Basic ${btoa(this.username + ":" + this.password)}`;
      const url = "https://api.github.com/repos/%repoOwner/%repoName/issues";
      this.saveRepos.forEach((repo, i) => {
        this.$set(this.results, i, {
          message: `Saving issue to ${repo.full_name}`
        });
        const repoOwner = repo.owner.login;
        const repoName = repo.name;
        let repoUrl = url
          .replace("%repoOwner", repoOwner)
          .replace("%repoName", repoName);

        const finallyFunc = () => {
          setTimeout(() => {
            this.$delete(this.results, i);
          }, 3500);
        };
        const issue = Object.assign({}, this.issue);
        if (!issue.milestone) {
          delete issue.milestone;
        }
        this.$http
          .post(repoUrl, issue, {
            headers: { Authorization: auth }
          })
          .then(result => {
            this.$set(this.results, i, {
              success: true,
              message: `Successfully saved issue to ${repo.full_name}`
            });
            finallyFunc();
          })
          .catch(e => {
            this.$set(this.results, i, {
              success: false,
              message: `There was an error saving issue to ${repo.full_name}`
            });
            finallyFunc();
          });
      });
    },
    fetchRepos() {
      clearTimeout(this.orgsTimeout);
      this.orgsTimeout = setTimeout(() => {
        if (!this.orgName) return;
        this.$http
          .get(`https://api.github.com/${this.orgOrUser}/${this.orgName}/repos`)
          .then(
            response => {
              // get body data
              return response.json();
            },
            response => {
              // error callback
            }
          )
          .then(response => {
            console.log(response);
            this.$set(this, "repo_list", response);
          });
      }, 500);
    }
  },
  created() {
    // const org = "big-neon";
    this.fetchRepos();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
