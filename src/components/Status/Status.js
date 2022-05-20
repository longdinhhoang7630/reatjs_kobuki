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
        <div className="card ml-2 border-white bg-dark">
          <h5 className="text-white" style={{ fontSize: "24px", paddingTop:"10px" }}><strong>Status</strong></h5>
          <hr style={{borderTop: "1px solid rgb(177,235,177)"}}></hr>
          <div style={{ padding: "1rem 0rem 0rem 0rem" }}>
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
                    <div style={{ fontSize: "3rem", color:"white", marginTop: "2rem", marginBottom: "0rem", paddingBottom: "0rem"}}>
                      <strong>{this.state.speed}</strong>m/s
                    </div>
                    <div style={{ fontSize: "1.6rem", marginTop: "2rem", color:"white" }}>
                      Speed
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
                    <div style={{ fontSize: "20px", marginTop: "1rem", color:"white" }}>
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
                    <div style={{ fontSize: "20px", marginTop: "1rem", color:"white" }}>
                      <strong>{this.state.memory}%</strong>
                      <p>memory</p>
                    </div>
                  </CircularProgressbarWithChildren>
                </Container>
              </Col>
            </Row>
            <Row style={{marginTop: "1.5rem"}}>
              <Col>
                <h5 style={{color: "white" }}>Battery: {this.state.battery}%</h5><ProgressBar variant="success" animated now={this.state.battery}/>
              </Col>
            </Row>
            {/* <Row>
              <Col>
                <LineChart />
              </Col>
            </Row> */}
          </div>
        </div>
      </Container>
    )
  }
}

export default Status;