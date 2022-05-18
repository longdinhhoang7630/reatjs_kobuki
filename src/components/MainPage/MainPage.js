import React, { Component } from 'react';
import ROSLIB from "roslib";
import "./MainPage.css";
import { Button, Container, Col, Row } from 'react-bootstrap';
import Parameters from "../Parameters/Parameters";
import Map from "../Map/Map";
import Camera from "../Camera/Camera";
import Controller from "../Controller/Controller";
import Status from "../Status/Status";
import Header from "../Header/Header";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnectedWS: false,
      linearVel: 0.3,
      angularVel: 0.5,
    };
    this.url = "ws://192.168.0.100:9090";
    this.ros = null;
    // Control
    this.arrVel = [
      [
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, -1],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0],
        [-1, 0, 0, 0, 0, 1],
      ],
      [
        [1, -1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0],
        [0, -1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [-1, -1, 0, 0, 0, 0],
        [-1, 0, 0, 0, 0, 0],
        [-1, 1, 0, 0, 0, 0],
      ]
    ];
    this.cur_dir = 4; // Stop

    this.connectWebsocket = this.connectWebsocket.bind(this);
    this.registerTopic = this.registerTopic.bind(this);
    this.onControl = this.onControl.bind(this);
    this.onChangeAngularVel = this.onChangeAngularVel.bind(this);
    this.onChangeLinearVel = this.onChangeLinearVel.bind(this);

    this.cmdVel = null;

    // this.btnConnect = this.btnConnect.bind(this);
    // this.btnDisconnect = this.btnDisconnect.bind(this);
  }
  registerTopic() {
    if (this.isConnectedWS === false) {
      return;
    }
    this.cmdVel = new ROSLIB.Topic({
      ros : this.ros,
      name : '/cmd_vel_mux/safety_controller',
      messageType : 'geometry_msgs/Twist'
    });
    console.log("published topic /cmd_vel_mux/safety_controller");
  }
  connectWebsocket() {
    console.log("connect to " + this.url);
    this.ros = new ROSLIB.Ros({
      url: this.url,
    });
    this.ros.on("connection", () => {
      this.setState({isConnectedWS: true});
      console.log("Connected to websocket server ");
      this.registerTopic();
    });
    this.ros.on("error", (err) => {
      console.log("Error connecting to websocket server ", err);
    });
    this.ros.on("close", () => {
      this.setState({isConnectedWS: false});
      console.log("Connection to websocket server closed, try to connect after 3s");
      setTimeout(() => {
        this.connectWebsocket();
      }, 3000);
    });
  }

  componentDidMount() {
    this.connectWebsocket();
  }

  // Controller callback
  onControl(mode, direction) {
    this.cur_dir = direction;
    if (!this.cmdVel) {
      return;
    }
    console.log("mode " + mode + " direction " + direction + " with velocity " + this.linearVel + ", " + this.angularVel);
    if (mode > 1 || mode < 0 || direction < 0 || direction > 9) {
      console.log("Invalid control");
    }
    var newVelMsg = new ROSLIB.Message({
      linear : {
        x : this.arrVel[mode][direction][0] * this.linearVel,
        y : this.arrVel[mode][direction][1] * this.linearVel,
        z : this.arrVel[mode][direction][2] * this.linearVel,
      },
      angular : {
        x : this.arrVel[mode][direction][3] * this.angularVel,
        y : this.arrVel[mode][direction][4] * this.angularVel,
        z : this.arrVel[mode][direction][5] * this.angularVel,
      }
    });
    this.cmdVel.publish(newVelMsg);
  }

  // Parameters callback
  onChangeAngularVel(vel) {
    var angularVel = vel;
    angularVel = angularVel > 1 ? 1 : angularVel;
    angularVel = angularVel < 0.05 ? 0.05 : angularVel;
    console.log("Angular velocity changed: " + angularVel);
    this.setState({angularVel: angularVel});
    // this.onControl(0, this.cur_dir);
  }

  onChangeLinearVel(vel) {
    var linearVel = vel;
    linearVel = linearVel > 1 ? 1 : linearVel;
    linearVel = linearVel < 0.05 ? 0.05 : linearVel;
    console.log("Linear velocity changed: " + linearVel);
    this.setState({linearVel: linearVel});
    // this.onControl(0, this.cur_dir);
  }

  render() {
    return (
      <Container fluid className="container-center">
        {/* <Row>
          <Col>
            <Container>
              <Header
                isConnected={this.state.isConnectedWS}
              />
            </Container>
          </Col>
        </Row> */}
        <Row>
          <Col>
            <Row>
              <Col>{this.state.isConnectedWS ? <Camera ros={this.ros} /> : <Camera ros={null} />}</Col>
            </Row>
            <Row>
              <Col>{this.state.isConnectedWS ? <Status ros={this.ros} /> : <Status ros={null} />}</Col>
            </Row>
          </Col>
          <Col xs={6}>
            <Row>
              <Col>{this.state.isConnectedWS && <Map ros={this.ros}/>}</Col>
            </Row>
            <Row>
              <Col>
                <Container>
                  <Header
                    isConnected={this.state.isConnectedWS}
                  />
                </Container>
              </Col>
            </Row>
          </Col>
          <Col>
            <Row>
              <Col>{this.state.isConnectedWS ?
                <Controller ros={this.ros} linearVel={this.state.linearVel} angularVel={this.state.angularVel} /> : 
                <Controller ros={null}/>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Parameters
                  onChangeLinearVel={this.onChangeLinearVel}
                  onChangeAngularVel={this.onChangeAngularVel}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default MainPage;