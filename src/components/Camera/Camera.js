import React, { Component } from "react";
import { Container, Card, Col, Row } from "react-bootstrap";
import ROSLIB from "roslib";
import "../CommonStyle.css";
import "./Camera.css";

var tempImage = require('./not-available.png');

class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableCamera: false,
    };
    this.ros = props.ros || null;
    this.subCamera = null;
    this.subcribeCameraTopic = this.subcribeCameraTopic.bind(this);
    this.unsubscribeCameraTopic = this.unsubscribeCameraTopic.bind(this);
  }
  componentDidMount() {
  }

  componentDidUpdate() {
    if (this.ros == null) {
      this.ros = this.props.ros;
      this.subCamera = new ROSLIB.Topic({
        ros: this.ros,
        name: '/camera_01/rgb/image_rect_color/compressed',
        messageType: 'sensor_msgs/CompressedImage'
      });
    }
  }

  subcribeCameraTopic() {
    this.subCamera.subscribe(function(message) {
      document.getElementById('camera_id').src = "data:image/jpg;base64," + message.data;
    });
  }
  unsubscribeCameraTopic() {
    if (this.subCamera) {
      this.subCamera.unsubscribe();
      document.getElementById('camera_id').src = tempImage;
    }
  }
  render() {
    return (
      <Container className="box-margin">
        <div className="card ml-2 border-white bg-dark">
          <h5 className="text-white" style={{ fontSize: "24px", paddingTop:"10px"}}><strong>Camera 1</strong></h5>
          <hr style={{borderTop: "1px solid rgb(177,235,177)"}}></hr>
          <div style={{ padding: "1rem 0rem 0rem 0rem" }}>
            <Row>
              <Col className="text-white" style={{fontSize: "20px"}}>Enable Camera</Col>
              <Col>
                <label className="switch">
                  <input onChange={(event) => {
                    this.setState({enableCamera: event.target.checked});
                    if (this.state.enableCamera) this.unsubscribeCameraTopic(); else this.subcribeCameraTopic();
                  }
                  }
                  checked={this.state.enableCamera} type="checkbox"
                />
                  <span className="slider round"></span>
                </label>
              </Col>
            </Row>
            <Container className="camera-container">
              <img id="camera_id" width={320} src={tempImage} alt="new"></img>
            </Container>
          </div>
        </div>
      </Container>
    )
  }
}

export default Camera;