import React, { Component } from "react";
import config from "../../config";
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Container, Row, Badge, Form } from 'react-bootstrap'
import PageLoader from "../common/pageLoader";
import {
    Grid,
  } from '@material-ui/core'

const fetch = require('node-fetch');

class Controller extends Component {
    state = {
        page: 0,
        account: null,
        privateKey: null,
        did: null,
        loading: false,
        addVerifier: false,
        requestPOR: false,
        submitSig: false,
        resolve: false,
        check: false,
        success: false
    };

    constructor(props) {
        super(props);
        /* 1. Initialize Ref */
        this.accountInput = React.createRef(); 
        this.privateKeyInput = React.createRef(); 
        this.didInput = React.createRef(); 
     }

    addVerifier = () => {
        this.setState({ loading: true })
        let body = {
            "contract_address" : config.contract_address,
            "user_address" : this.accountInput.current.value, // config.user_address, 
            "privateKey" : this.privateKeyInput.current.value // config.privateKey //this.privateKeyInput.current.value
          };
          
          fetch(config.apiUrl + '/api/v1/verifier', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res.status !== 200) 
            throw Error(res.message);
            // alert("success")
            this.setState({ loading: false, addVerifier: true, account: this.accountInput.current.value, privateKey: this.privateKeyInput.current.value})
        })
        .catch(error => {
            alert(error)
          })
      };

      // API call -> request POR
      requestPOR = () => {
        this.setState({ loading: true })
        let body = {
            "contract_address" : config.contract_address,
            "user_address" : this.state.account, 
            "privateKey" : this.state.privateKey,
            "did": this.didInput.current.value
          };
          
          fetch(config.apiUrl + '/api/v1/request', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res.status !== 200) 
            throw Error(res.message);

            this.setState({ loading: false, requestPOR: true, did: this.didInput.current.value})
        })
        .catch(error => {
            alert(error)
          })
      };

      // API call -> submit signature
      submitSig = () => {
        this.setState({ loading: true })
        let body = {
            "contract_address" : config.contract_address,
            "user_address" : this.state.account, 
            "privateKey" : this.state.privateKey,
            "did": this.state.did
          };
          
          fetch(config.apiUrl + '/api/v1/submit', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res.status !== 200) 
            throw Error(res.message);

            this.setState({ loading: false, submitSig: true })
        })
        .catch(error => {
            alert(error)
          })
      };

      // resolve challenge
      resolve = () => {
        this.setState({ loading: true })
        let body = {
            "contract_address" : config.contract_address,
            "user_address" : this.state.account, 
            "privateKey" : this.state.privateKey,
            "did": this.state.did
          };
          
          fetch(config.apiUrl + '/api/v1/resolve', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res.status !== 200) 
            throw Error(res.message);

            this.setState({ loading: false, resolve: true })
        })
        .catch(error => {
            alert(error)
          })
      };

      // check status
      check = () => {
        this.setState({ loading: true })
        let body = {
            "contract_address" : config.contract_address,
            "user_address" : this.state.account, 
            "privateKey" : this.state.privateKey,
            "did": this.state.did
          };
          
          fetch(config.apiUrl + '/api/v1/check', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res.status !== 200) 
            throw Error(res.message);

            this.setState({ loading: false, check: true, success: res.success })
        })
        .catch(error => {
            alert(error)
          })
      };


      onNext = (event) => {
        switch (this.state.page) {
          case 0:
            this.setState({ page: 1 })
            break;
          case 1:
            this.setState({ page: 2 })
            break;
          case 2:
            this.setState({ page: 3 })
            break;
          default:
          break;
        }
      };

      resetPage = () => {
        this.setState({
          page: 0,
          account: null,
          privateKey: null,
          did: null,
          loading: false,
          addVerifier: false,
          requestPOR: false,
          submitSig: false,
          resolve: false,
          check: false,
        })
      };

    SwitchButtonPage0 = () => {
        const verifierAdded = this.state.addVerifier
        if (!verifierAdded) {
            return <Button variant="primary" type="submit" onClick={(event) => { this.addVerifier(event);}}>Register</Button>;
        }
        return <Button variant="primary" type="submit" onClick={(event) => { this.onNext(event);}}>Next</Button>;
    }

    // step 1: register as verifier (input address and private key)
    renderPage0 = () => {
        return(
            <Container >
                <Row className="justify-content-md-center">
                <h4>Step 1: register user as a verifier</h4>
                </Row>
                
                <Form>
                <Form.Group controlId="formBasicEmail">
                <Form.Label>Wallet address</Form.Label>
                <Form.Control type="text" placeholder="e.g., 0x3ba5b74..."  ref={this.accountInput} />  
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                <Form.Label>Private Key</Form.Label>
                <Form.Control type="text" placeholder="e.g., 2f03955ed4..." ref={this.privateKeyInput}/>
                <Form.Text className="text-muted">
                Used to send transaction to blockchain. Make sure this wallet is funded.
                </Form.Text>
                </Form.Group>
                </Form> 
                <this.SwitchButtonPage0 />
            </Container>
        )
    };

    // Step 2: request por verification
    renderPage1 = () => {
        return(
            <Container >
                <Row className="justify-content-md-center">
                <h4>Step 2: request por verification</h4>
                </Row>
                <Form>
                <Form.Group controlId="formBasicEmail">
                <Form.Label>Input Asset DID to request por verification</Form.Label>
                <Form.Control type="text" placeholder="e.g., 1, 2, ..."  ref={this.didInput}/>  
                </Form.Group>
                </Form> 
                <this.SwitchButtonPage1 />
            </Container>
        )
    };

    SwitchButtonPage1 = () => {
        const porRequested = this.state.requestPOR
        if (!porRequested) {
            return <Button variant="primary" type="submit" onClick={(event) => { this.requestPOR(event);}}>Request</Button>;
        }
        return <Button variant="primary" type="submit" onClick={(event) => { this.onNext(event);}}>Next</Button>;
    }

    // Step 3: submit signature
    renderPage2 = () => {
        return(
            <Container >
                <Row className="justify-content-md-center">
                <h4>Step 3: Submit Signature</h4>
                </Row>
                <Row className="justify-content-md-left">
                <h5>current challenge {this.state.did} status: <this.ShowBadge /> </h5>
                </Row>
                <this.SwitchButtonPage2 />
            </Container>
        )
    };

    ShowBadge = () => {
        const status = this.state.success
        if(status){
            return <Badge variant="success">True</Badge>
        }
        return <Badge variant="secondary">False</Badge>
    }

    SwitchButtonPage2 = () => {
        const sigSubmitted = this.state.submitSig
        if (!sigSubmitted) {
            return <Button variant="primary" type="submit" onClick={(event) => { this.submitSig(event);}}>Submit Signature</Button>;
        }
        return <Button variant="primary" type="submit" onClick={(event) => { this.onNext(event);}}>Next</Button>;
    }


    // Step 4: resolve challenge and check status
    renderPage3 = () => {
        return(
            <Container >
                <Row className="justify-content-md-center">
                <h4>Step 4: Resolve Challenge and Check Status</h4>
                </Row>
                <Row className="justify-content-md-left">
                    <h5>current challenge {this.state.did} status: <this.ShowBadge /> </h5>
                </Row>
                <this.SwitchButtonPage3 />
            </Container>
        )
    };

    SwitchButtonPage3 = () => {
        const resolved = this.state.resolve
        const checked = this.state.check
        if (!resolved && !checked) {
            return <Button variant="primary" type="submit" onClick={(event) => { this.resolve(event);}}>Resolve Challenge</Button>;
        } else if (resolved && !checked){
            return <Button variant="primary" type="submit" onClick={(event) => { this.check(event);}}>Check Status</Button>;
        }
        return <Button variant="primary" type="submit" onClick={(event) => { this.resetPage(event);}}>Done</Button>;
    }

    render() {
        const {
          page,
          loading
        } = this.state
    
        return (
          <Grid container>
            { loading && <PageLoader /> }
            { page === 0 && this.renderPage0() }
            { page === 1 && this.renderPage1() }
            { page === 2 && this.renderPage2() }
            { page === 3 && this.renderPage3() }
          </Grid>
        )
    }
}

  
export default Controller;