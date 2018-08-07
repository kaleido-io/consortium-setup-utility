const requestPromise = require('request-promise');
const request = require('request');

class KaleidoSetup {

    constructor(apiKey) {
        this.apiHost = 'https://console.kaleido.io'
        this.apiKey = apiKey;
    }

    retrieveRegions() {
        let options = {
            uri: this.apiHost + '/api/v1/regions',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    getApiKey() {
        return this.apiKey;
    }

    getApiHost() {
        return this.apiHost;
    }

    setApiHost(apiHost) {
        this.apiHost = apiHost;
    }

    setup(consortiumData, dontRecreateApplicationCredentials) {

        this.dontRecreateApplicationCredentials = dontRecreateApplicationCredentials;

        let consortium;
        let environments;
        let memberships;
        let nodes;

        return this.setupConsortium(consortiumData.name, consortiumData.description).then((result) => {

            consortium = result;
            return this.retrieveMemberships(consortium);

        }).then((result) => {

            let membershipPromises = [];
            for(let membershipData of consortiumData.memberships) {
                membershipPromises.push(this.setupMembership(consortium, result, membershipData));
            }
            return Promise.all(membershipPromises);
            
        }).then((result) => {

            memberships = result;
            return this.retrieveEnvironments(consortium);

        }).then((result) => {

            let environmentPromises = [];
            for(let environmentData of consortiumData.environments) {
                environmentPromises.push(this.setupEnvironment(consortium, result, environmentData));
            }
            return Promise.all(environmentPromises);

        }).then((result) => {

            let nodePromises = [];
            environments = [];
            for(let environmentData of consortiumData.environments) {
                let environment = this.getEnvironmentByName(result, environmentData.name);
                environments.push(environment);
                nodePromises.push(this.setupNodes(consortium, environment, memberships, environmentData));
            }
            return Promise.all(nodePromises);

        }).then((result) => {
            
            nodes = result;
            let applicationCredentialsPromises = [];
            for(let environmentData of consortiumData.environments) {
                let environment = this.getEnvironmentByName(environments, environmentData.name);
                applicationCredentialsPromises.push(this.setupAllApplicationCredentials(consortium, environment, memberships, environmentData.applicationCredentials));

            }
            return Promise.all(applicationCredentialsPromises);

        }).then(async (result) => {

            return {
                consortium: consortium,
                environments: environments,
                memberships: memberships,
                nodes: nodes,
                applicationCredentials: result
            }

        });
    }


    /* * * CONSORTIUM * * */

    retrieveConsortia() {
        let options = {
            uri: this.apiHost + '/api/v1/consortia',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    createConsortium(name, description) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: {
                name: name,
                description: description
            },
            json: true
        };
        return requestPromise(options);
    }

    setupConsortium(name, description) {
        return this.retrieveConsortia().then((consortia) => {
            for(let consortium of consortia) {
                if(consortium.name == name
                && consortium.description == description
                && !(consortium.state == 'deleted' || consortium.state == 'delete_pending')) {
                    return consortium;
                }
            }
            return this.createConsortium(name, description);
        });
    }


    /* * * MEMBERSHIPS * * */

    retrieveMemberships(consortium) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/memberships',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    createMembership(consortium, name) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/memberships',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: {
                org_name: name
            },
            json: true
        };
        return requestPromise(options);
    }

    setupMembership(consortium, memberships, membershipData) {
        for(let membership of memberships) {
            if(membershipData.name == membership.org_name
            && !(membership.state == 'deleted' || membership.state == 'delete_pending')) {
                return membership;
            }
        }
        return this.createMembership(consortium, membershipData.name);
    }

    getMembershipForOrgName(memberships, name) {
        for(let membership of memberships) {
            if(membership.org_name == name) {
                return membership;
            }
        }
    }


    /* * * ENVIRONMENTS * * */

    retrieveEnvironments(consortium) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    createEnvironment(consortium, name, provider, consensusType) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: {
                name: name,
                provider: provider,
                consensus_type: consensusType
            },
            json: true
        };
        return requestPromise(options);
    }

    setupEnvironment(consortium, environments, environmentData) {
        for(let environment of environments) {
            if(environmentData.name == environment.name
            && !(environment.state == 'deleted' || environment.state == 'delete_pending')) {
                return environment;
            }
        }
        return this.createEnvironment(consortium, environmentData.name, environmentData.provider, environmentData.consensusType);
    }

    getEnvironmentByName(environments, name) {
        for(let environment of environments) {
            if(environment.name == name) {
                return environment;
            }
        }
    }


    /* * * NODES * * */

    retrieveNode(consortium, environment, nodeId) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments/' + environment._id + '/nodes/' + nodeId,
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    retrieveNodes(consortium, environment) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments/' + environment._id + '/nodes',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    createNode(consortium, environment, name, membership) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments/' + environment._id + '/nodes',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: {
                name: name,
                membership_id: membership._id
            },
            json: true
        };
        return requestPromise(options);
    }

    setupNode(consortium, environment, nodes, memberships, nodeData) {
        let membership = this.getMembershipForOrgName(memberships, nodeData.owner);
        for(let node of nodes) {
            if(nodeData.name == node.name &&
            node.membership_id == membership._id &&
            !(node.state == 'deleted' || node.state == 'delete_pending')) {
                return node;
            }
        }
        return this.createNode(consortium, environment, nodeData.name, membership);
    }

    setupAndWaitForNode(consortium, environment, nodes, memberships, nodeData) {
        return new Promise(async (resolve, reject) => {
            let setupNode = await this.setupNode(consortium, environment, nodes, memberships, nodeData);
            let nodeId = setupNode._id;
            let node = {};
            while(node.state != 'started') {
                try {
                    node = await this.retrieveNode(consortium, environment, nodeId);
                } catch(error) {}
                if(node.state != 'started') {
                    await new Promise((resolve) => setTimeout(resolve, 2500));
                }
            }
            resolve(node);
        });
    }

    setupNodes(consortium, environment, memberships, environmentData) {
        if(environmentData.nodes) {
            return this.retrieveNodes(consortium, environment).then((nodes) => {
                let nodePromises = [];
                for(let nodeData of environmentData.nodes) {
                    nodePromises.push(this.setupAndWaitForNode(consortium, environment, nodes, memberships, nodeData));
                }
                return Promise.all(nodePromises);
            });
        }
        return [];
    }


    /* * * APPLICATION CREDENTIALS * * */

    retrieveApplicationCredentials(consortium, environment) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments/' + environment._id + '/appcreds',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            json: true
        };
        return requestPromise(options);
    }

    createApplicationCredentials(consortium, environment, membership, name) {
        let options = {
            uri: this.apiHost + '/api/v1/consortia/' + consortium._id + '/environments/' + environment._id + '/appcreds',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.apiKey
            },
            body: {
                name: name,
                membership_id: membership._id
            },
            json: true
        };
        return requestPromise(options);
    }

    setupSingleApplicationCredentials(consortium, environment, membership, applicationCredentials, name) {
        if(this.dontRecreateApplicationCredentials) {
            for(let singleApplicationCredentials of applicationCredentials) {
                if(singleApplicationCredentials.name == name &&
                    singleApplicationCredentials.membership_id == membership._id) {
                    return singleApplicationCredentials;
                }
            }
        }
        return this.createApplicationCredentials(consortium, environment, membership, name);
    }

    setupAllApplicationCredentials(consortium, environment, memberships, applicationCredentialsData) {
        if(applicationCredentialsData) {
            return this.retrieveApplicationCredentials(consortium, environment).then((applicationCredentials) => {
                let applicationCredentialsPromises = [];
                for(let credentialsData of applicationCredentialsData) {
                    let membership = this.getMembershipForOrgName(memberships, credentialsData.owner)
                    applicationCredentialsPromises.push(this.setupSingleApplicationCredentials(consortium, environment, membership, applicationCredentials, credentialsData.name));
                }
                return Promise.all(applicationCredentialsPromises);
            });
        }
        return [];
    }

}

module.exports = KaleidoSetup;