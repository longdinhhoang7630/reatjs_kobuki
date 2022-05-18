import React, { Component } from "react";
import "./Header.css";
import "../CommonStyle.css"
import { Container, Col, Row, Alert } from "react-bootstrap";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      isConnected: false,
    };
    this.connectCb = props.connectCb;
    this.disconnectCb = props.disconnectCb;
    this.url = "ws://192.168.0.100:9090";
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {

  }

  componentWillReceiveProps(props) {
    this.setState({ isConnected: props.isConnected })
  }

  handleChange(event) {
    this.state.value = event.target.value;
  }

  handleSubmit(event) {
    if (!this.state.isConnected) {
      if (this.state.value ==='') {
        this.connectCb(this.url);
      } else {
        this.connectCb(this.state.value);
      }
    } else {
      this.disconnectCb();
    }
    event.preventDefault();
  }

  render() {
    return (
      <Container className="header-common">
        <Alert variant={this.state.isConnected ? "success" : "danger"} style={{margin: "0"}}>
          {this.state.isConnected ? "Server is online !" : "Server is not available"}
        </Alert>
        {/* <form onSubmit={this.handleSubmit} style={{ margin: "0 auto", width: "45%" }}>
          <Row className="align-items-center">
            <Col>
              <input type="text" className="form-control" name="name" placeholder="Input Websocket URL" onChange={this.handleChange} />
            </Col>
            <Col xs="auto">
              <input type="submit"
                className={"btn btn-large centerButton " + (this.state.isConnected ? "btn-danger":"btn-primary")}
                style={{width: "7rem"}}
                value={this.state.isConnected ? "Connected" : "Connect"} />
            </Col>
          </Row>
        </form> */}
      </Container>
    )
  }
}

export default Header;