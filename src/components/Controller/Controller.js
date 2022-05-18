import React, { Component } from "react";
import { Container, Card, Col, Row, Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import "../CommonStyle.css";
import "./Controller.css";
import { Direction } from "../Common/Common.ts";
import ROSLIB from "roslib";

const Command = [
  {
    dir: Direction.NorthWest, code: 81
  },
  {
    dir: Direction.North, code: 87
  },
  {
    dir: Direction.NorthEast, code: 69
  },
  {
    dir: Direction.West, code: 65
  },
  {
    dir: Direction.Center, code: 88
  },
  {
    dir: Direction.East, code: 68
  },
  {
    dir: Direction.SouthWest, code: 90
  },
  {
    dir: Direction.South, code: 83
  },
  {
    dir: Direction.SouthEast, code: 67
  },
];

function ControlButton(props) {
  return <Button variant="secondary" size="lg" className="button-control" onClick={props.onClick}>{props.label}</Button>
}

function ButtonDonotThing(props) {
  return <Button variant="secondary" size="lg" className="button-donot-thing" onClick={props.onClick}>{props.label}</Button>
}

const radios = [
  { name: 'Mapping', value: '1' },
  { name: 'Localization',   value: '2' },
];

const arrVel = [
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

class Controller extends Component {
  constructor(props) {
    super(props);
    // this.onControl = props.onControl;
    this.state = {
      keyboard_enable: false,
      radioValue: '1',
      checked: false,
    };
    this.angularVel = props.angularVel || 0;
    this.linearVel = props.linearVel || 0;
    this.ros = props.ros || null;
    this.addEventKeyboard = false;
    this.onChangeKeyboardControl = this.onChangeKeyboardControl.bind(this);
    this.onClickControlButton = this.onClickControlButton.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.onControl = this.onControl.bind(this);
    this.cur_dir = 4; // stop
    this.cmdVel = null;
    this.mappingModeService = null;
    this.localizationModeService = null;
  }

  _handleKeyDown = (event) => {
    // console.log("pressed " + event.keyCode);
    let target = Command.find(item => {
      if (item.code === event.keyCode) {
        return item;
      }
    });
    if (target) {
      // console.log("press dir " + target.dir);
      this.onControl(0, target.dir);
    }
  }

  componentDidUpdate() {
    this.angularVel = this.props.angularVel || 0;
    this.linearVel = this.props.linearVel || 0;
    if (this.ros !== this.props.ros) {
      this.ros = this.props.ros;
      if (this.ros != null) {
        console.log('abc')
        this.cmdVel = new ROSLIB.Topic({
          ros : this.ros,
          name : '/keyop_vel_smoother/raw_cmd_vel',
          messageType : 'geometry_msgs/Twist'
        });
        var newVelMsg = new ROSLIB.Message({
          linear : {
            x : 0,
            y : 0,
            z : 0,
          },
          angular : {
            x : 0,
            y : 0,
            z : 0,
          }
        });
        this.cur_dir = 4;
        this.cmdVel.publish(newVelMsg);

        this.mappingModeService = new ROSLIB.Service({
          ros: this.ros,
          name: '/rtabmap/set_mode_mapping',
          serviceType: 'std_srvs/Empty'
        });
        this.localizationModeService = new ROSLIB.Service({
          ros: this.ros,
          name: '/rtabmap/set_mode_localization',
          serviceType: 'std_srvs/Empty'
        });
      }
    }
  }

  componentDidMount() {
    // BannerDataStore.addChangeListener(this._onchange);
    // document.addEventListener("keydown", this._handleKeyDown);
  }

  componentWillUnmount() {
    // BannerDataStore.removeChangeListener(this._onchange);
    if (this.addEventKeyboard) {
      document.removeEventListener("keydown", this._handleKeyDown);
    }
  }

  onChangeKeyboardControl(event) {
    console.log("change switch " + event.target.checked);
    this.setState({ keyboard_enable: event.target.checked });
    if (event.target.checked === true) {
      if (!this.addEventKeyboard) {
        console.log("Enable keyboard");
        document.addEventListener("keydown", this._handleKeyDown);
        this.addEventKeyboard = true;
      }
    } else if (event.target.checked === false) {
      if (this.addEventKeyboard) {
        console.log("Disable keyboard");
        document.removeEventListener("keydown", this._handleKeyDown);
        this.addEventKeyboard = false;
      }
    }
  }

  onControl(mode, dir) {
    this.cur_dir = dir;
    if (!this.cmdVel || this.ros == null) {
      return;
    }
    console.log("mode " + mode + " direction " + dir + " with velocity " + this.linearVel + ", " + this.angularVel);
    if (mode > 1 || mode < 0 || dir < 0 || dir > 9) {
      console.log("Invalid control");
    }
    var newVelMsg = new ROSLIB.Message({
      linear : {
        x : arrVel[mode][dir][0] * this.linearVel,
        y : arrVel[mode][dir][1] * this.linearVel,
        z : arrVel[mode][dir][2] * this.linearVel,
      },
      angular : {
        x : arrVel[mode][dir][3] * this.angularVel,
        y : arrVel[mode][dir][4] * this.angularVel,
        z : arrVel[mode][dir][5] * this.angularVel,
      }
    });
    this.cmdVel.publish(newVelMsg);
  }

  onClickControlButton(direction) {
    console.log("click " + direction);
    this.onControl(0, direction);
  }

  render() {
    return (
      <Container className="box-margin">
        <Card border="secondary">
          <Card.Header style={{fontSize: "1.2rem" }}><strong>Controller</strong></Card.Header>
          <Card.Body>
            <Row sm={1} md={2} lg={2}>
              <Col>Keyboard Control</Col>
              <Col>
                <label className="switch">
                  <input onChange={this.onChangeKeyboardControl} checked={this.state.keyboard_enable} type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </Col>
            </Row>
            <Row sm={2} md={3} lg={3}>
              <Col><ControlButton label="Q" onClick={() => this.onClickControlButton(Direction.NorthWest)} /></Col>
              <Col><ControlButton label="W" onClick={() => this.onClickControlButton(Direction.North)} /></Col>
              <Col><ControlButton label="E" onClick={() => this.onClickControlButton(Direction.NorthEast)} /></Col>
            </Row>
            <Row sm={2} md={3} lg={3}>
              <Col><ControlButton label="A" onClick={() => this.onClickControlButton(Direction.West)} /></Col>
              <Col ><ButtonDonotThing label="" onClick={() => this.onClickControlButton(Direction.Center)} /></Col>
              <Col><ControlButton label="D" onClick={() => this.onClickControlButton(Direction.East)} /></Col>
            </Row>
            <Row sm={2} md={3} lg={3}>
              <Col><ControlButton label="Z" onClick={() => this.onClickControlButton(Direction.SouthWest)} /></Col>
              <Col><ControlButton label="S" onClick={() => this.onClickControlButton(Direction.South)} /></Col>
              <Col><ControlButton label="C" onClick={() => this.onClickControlButton(Direction.SouthEast)} /></Col>
            </Row>
            {/* <Row style={{borderBottom: "1px dotted gray", paddingBottom: "1rem"}}>
              <Col><Button variant="secondary" size="lg" style={{ width: "100%", height: "6ex", margin: "0.75ex" }}>Shift</Button></Col>
            </Row> */}
            <Row style={{marginTop: "1rem"}}>
              <Col sm={4}><p style={{margin: "0.5rem", fontSize: "1.1rem", textAlign: "center"}}>Mode</p></Col>
              <Col>
                <ButtonGroup toggle>
                  {radios.map((radio, idx) => (
                    <ToggleButton
                      key={idx}
                      type="radio"
                      variant="secondary"
                      name="radio"
                      value={radio.value}
                      checked={this.state.radioValue === radio.value}
                      onChange = {(e) => {
                        this.setState({radioValue: e.currentTarget.value});
                        e.currentTarget.value === '1' ? this.mappingModeService.callService() : this.localizationModeService.callService();
                        
                      }}>
                      {radio.name}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    )
  }
}

export default Controller;