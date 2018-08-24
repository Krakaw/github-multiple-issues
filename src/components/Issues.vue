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
            <md-switch v-model="selected[i]" value="1">{{repo.full_name}} </md-switch>
            <a style="float:right" :href="`https://www.github.com/${repo.full_name}`" target="_blank">
              <md-icon>open_in_new</md-icon>
            </a>
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
          <md-chips v-model="issue.labels" md-placeholder="Add labels..."></md-chips>
          <div v-for="(repo, repoId) in selectedRepos" :key="repoId">
            <md-field>
              <label>Milestone {{repo.full_name}}</label>
              <md-select v-model="overrideMilestone[repoId]">
                <md-option value="">None</md-option>
                <md-option v-for="(milestone, i) in repoMilestones[repoId]" :key="i" :value="milestone.number" md-dense>{{milestone.title}}</md-option>
              </md-select>
            </md-field>
          </div>

          <md-button :disabled="disableSave" class="md-raised md-primary" @click="addIssue()">Save</md-button>

        </md-content>
      </div>

    </div>
    <md-card v-for="(result, i) in results" :key="i">
      <md-card-media md-position="center" :md-duration="result.duration" md-active.sync="true">
        <md-icon v-if="result.hasOwnProperty('success')" :style="result.success ? 'color: green' : 'color:red'">{{result.success ? 'check' : 'clear'}}</md-icon>
        <span>{{result.message}}</span>
      </md-card-media>
    </md-card>
  <pre>{{repoMilestones}}</pre>

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
      repo_list: {},
      selected: {}, //Selected ID's
      issue: {
        title: "",
        body: "",
        labels: []
      },
      overrideMilestone: {},
      isSubmitting: false,
      results: {},
      repoMilestones: {}
    };
  },
  watch: {},
  computed: {
    selectedRepos() {
      const repos = {};
      for (let repoId in this.selected) {
        if (!this.selected[repoId]) {
          continue;
        }
        repos[repoId] = this.repo_list[repoId];
        this.fetchMilestones(repoId, repos[repoId].owner.login, repos[repoId].name);
      }
      return repos;
    },
    disableSave() {
      return (
        this.isSubmitting ||
        Object.keys(this.selected).length === 0 ||
        this.issue.title.trim() === ""
      );
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
    fetchMilestones(repoId, repoOwner, repoName) {
      this.$http.get(`https://api.github.com/repos/${repoOwner}/${repoName}/milestones`).then(response => {
return response.json();
      }, (e) => {
        return [];
      }).then(milestones => {
        this.$set(this.repoMilestones, repoId, milestones);
      })
    },
    addIssue() {
      this.$set(this, "results", {});
      this.isSubmitting = true;

      const auth = `Basic ${btoa(this.username + ":" + this.password)}`;
      const url = "https://api.github.com/repos/%repoOwner/%repoName/issues";

      for (let repoId in this.selected) {
        if (!this.selected[repoId]) {
          continue;
        }
        const repo = this.repo_list[repoId];
        this.$set(this.results, repoId, {
          message: `Saving issue to ${repo.full_name}`
        });
        const repoOwner = repo.owner.login;
        const repoName = repo.name;
        let repoUrl = url
          .replace("%repoOwner", repoOwner)
          .replace("%repoName", repoName);

        const finallyFunc = timeout => {
          timeout = timeout || 3500;
          setTimeout(() => {
            this.$delete(this.results, repoId);
            this.isSubmitting = false;
          }, timeout);
        };
        const issue = Object.assign({}, this.issue);
        if (this.overrideMilestone[repoId]) {
          issue.milestone = this.overrideMilestone[repoId];
        }
        this.$http
          .post(repoUrl, issue, {
            headers: { Authorization: auth }
          })
          .then(result => {
            this.$set(this.results, repoId, {
              success: true,
              message: `Successfully saved issue to ${repo.full_name}`
            });
            finallyFunc();
          })
          .catch(e => {
            e.json().then(e => {
              this.$set(this.results, repoId, {
                success: false,
                message: `There was an error saving issue to ${
                  repo.full_name
                } ${e.message}`
              });
              finallyFunc(10000);
            });
          });
      }
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
            let repos = {};
            response.forEach(repo => {
              repos[repo.id] = repo;
            });
            this.$set(this, "repo_list", repos);
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
