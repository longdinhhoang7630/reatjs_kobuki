import React, { Component } from "react";
import { Container, Card, Col, Row, ProgressBar } from "react-bootstrap";
import ROSLIB from 'roslib';
import "../CommonStyle.css";
import LineChart from './line';
import { CircularProgressbar, CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const value = 0.66;

class Status extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 0.3,
      cpu: 40,
      memory: 65,
      battery: 82,
    };
    this.ros = props.ros || null;
    this.subVelocity = null;
  }
  componentDidUpdate() {
    var that = this;
    if (this.ros !== this.props.ros) {
      this.ros = this.props.ros;
      if (this.ros != null) {
        // console.log('asdf')
        this.subVelocity = new ROSLIB.Topic({
          ros: this.ros,
          name: '/raw_vel',
          messageType: 'geometry_msgs/Twist'
        });
        this.subVelocity.subscribe(function(message) {
          console.log("velocity message", message.linear_x);
          that.setState({speed: Math.abs(Math.round(message.linear_x * 100) / 100)});
        });
      }
    }
  }
  render() {
    return (
      <Container className="box-margin">
        <Card border="secondary">
          <Card.Header style={{fontSize: "1.2rem" }}><strong>Status</strong></Card.Header>
          <Card.Body>
            {/* <Row>
              <Col>Memory</Col>
            </Row> */}
            <Row>
              <Col>
                <Container style={{maxWidth: "80%"}}>
                  <CircularProgressbarWithChildren
                    style={{maxWidth: "60%"}}
                    value={this.state.speed}
                    maxValue={1}
                    circleRatio={0.75}
                    styles={buildStyles({
                      rotation: 1 / 2 + 1 / 8,
                      trailColor: "#eee"
                    })}
                  >
                    <div style={{ fontSize: "3rem", marginTop: "2rem", marginBottom: "0rem", paddingBottom: "0rem"}}>
                      <strong>{this.state.speed}</strong>m/s
                    </div>
                    <div style={{ fontSize: "1.6rem", marginTop: "2rem" }}>
                      speed
                    </div>
                  </CircularProgressbarWithChildren>
                </Container>
              </Col>
            </Row>
            <Row>
              <Col>
                <Container>
                  <CircularProgressbarWithChildren
                    style={{maxWidth: "60%"}}
                    value={this.state.cpu / 100}
                    maxValue={1}
                  >
                    <div style={{ fontSize: "1rem", marginTop: "1rem" }}>
                      <strong>{this.state.cpu}%</strong>
                      <p>CPU</p>
                    </div>
                  </CircularProgressbarWithChildren>
                </Container>
              </Col>
              <Col>
                <Container>
                  <CircularProgressbarWithChildren
                    style={{maxWidth: "60%"}}
                    value={this.state.memory / 100}
                    maxValue={1}
                  >
                    <div style={{ fontSize: "1rem", marginTop: "1rem" }}>
                      <strong>{this.state.memory}%</strong>
                      <p>memory</p>
                    </div>
                  </CircularProgressbarWithChildren>
                </Container>
              </Col>
            </Row>
            <Row style={{marginTop: "1.5rem"}}>
              <Col>
                <ProgressBar variant="success" animated now={this.state.battery} label={`${this.state.battery}% Battery`}/>
              </Col>
            </Row>
            <Row>
              <Col>
                <LineChart />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    )
  }
}

export default Status;