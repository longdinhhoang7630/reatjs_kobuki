import React, { Component } from "react";
import { Container, Card, Button, Form, Col, Row, Alert } from "react-bootstrap";
import ROSLIB from "roslib";
// import "ros2d";
import Nav2d from "react-nav2djs";
import "./Map.css";
import "../CommonStyle.css";

class Map extends Component {
  constructor(props) {
    super(props);
    this.ros = props.ros || null;
    this.state = {
      command: 'none',
      message: 'Robot is ready !',
      stationName: 'NoName',
      enableCancel: false,
      stations: [],
    }
    this.stationListLoad = [];
    this.onAddStation = this.onAddStation.bind(this);
    this.onClickStation = this.onClickStation.bind(this);
    this.onSetGoal = this.onSetGoal.bind(this);
    this.actionClient = null;
    this.cancelAssignmentService = null;
    this.InsertStationService = null;
    this.DeleteStationService = null;
    this.GetStationService = null;
  }

  componentDidMount() {
    if (this.props.ros != null) {
      this.ros = this.props.ros;
      var serverName = this.props.serverName || '/move_base';
      var actionName = this.props.actionName || 'move_base_msgs/MoveBaseAction';
      this.actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: actionName,
        serverName: serverName
      });
      this.cancelAssignmentService = new ROSLIB.Service({
        ros: this.ros,
        name: '/rtabmap/cancel_goal',
        serviceType: 'std_srvs/Empty'
      });
      this.InsertStationService = new ROSLIB.Service({
        ros: this.ros,
        name: '/InsertStation',
        serviceType: 'jarvis_web_server/InsertStation',
      });
      this.DeleteStationService = new ROSLIB.Service({
        ros: this.ros,
        name: '/DeleteStation',
        serviceType: 'jarvis_web_server/DeleteStation',
      });
      this.GetStationService = new ROSLIB.Service({
        ros: this.ros,
        name: '/GetStation',
        serviceType: 'jarvis_web_server/GetStation',
      });
      this.GetStationService.callService(null,(res) => {
        // this.stationListLoad = res.stations;
        this.setState({stations: res.stations});
      });
    }
  }

  onAddStation(newStation) {
    if (newStation && newStation.name && newStation.pose && newStation.id && newStation.degrees && newStation.obj) {
      var stationList = this.state.stations;
      stationList.push(newStation);
      this.setState({stations: stationList});
      console.log("added new station", newStation.name);
      var request = new ROSLIB.ServiceRequest({
        station: {
          name: newStation.name,
          pose: newStation.pose,
          degrees: newStation.degrees,
          id: newStation.id,
        },
      });
      this.InsertStationService.callService(request);
    }
  }

  onClickStation(stationId) {
    var targetIndex = -1;
    this.state.stations.forEach((item, index) => {
      if (item.id === stationId) {
        targetIndex = index;
      }
    });
    if (targetIndex >= 0) {
      if (this.state.command === 'DeleteStation') {
        console.log("remove station", this.state.stations[targetIndex].name);
        var request = new ROSLIB.ServiceRequest({
          station: {
            name: this.state.stations[targetIndex].name,
            pose: this.state.stations[targetIndex].pose,
            degrees: this.state.stations[targetIndex].degrees,
            id: this.state.stations[targetIndex].id,
          }
        });
        this.DeleteStationService.callService(request);
        var stationList = this.state.stations;
        stationList.splice(targetIndex, 1);
        this.setState({stations: stationList});
      } else {
        console.log("Go to station", this.state.stations[targetIndex].name);
        this.setState({message: 'Robot is moving to station ' + this.state.stations[targetIndex].name, enableCancel: true, command: 'CancelGoal'});
        var goal = new ROSLIB.Goal({
          actionClient: this.actionClient,
          goalMessage: {
            target_pose: {
              header: {
                frame_id: 'map'
              },
              pose: this.state.stations[targetIndex].pose,
            }
          }
        });
        goal.send();
      }
    }
  }

  onSetGoal(obj, pose) {
    console.log("added new goal");
    this.setState({message: 'Robot is moving to Goal', enableCancel: true});
    // /*
    var goal = new ROSLIB.Goal({
      actionClient: this.actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: 'map'
          },
          pose: pose
        }
      }
    });
    goal.send();
    // */
    // var sendGoal = new ROSLIB.Topic({
    //   ros : this.ros,
    //   name : '/move_base_simple/goal',
    //   messageType : 'geometry_msgs/PoseStamped'
    // });

    // var message = new ROSLIB.Message({
    //   header: {
    //     stamp: Date.now(),
    //     frame_id: "map",
    //   },
    //   pose: {
    //     position: {
    //       x: 3.01919054985,
    //       y: 6.70290660858,
    //       z: 0.0,
    //     },
    //     orientation: {
    //       x: 0.0,
    //       y: 0.0,
    //       z: -0.493572111669,
    //       w: 0.869704875566,
    //     },
    //   }
    // });
    // sendGoal.publish(message);
  }

  render() {
    return (
      <Container className="box-margin">
        <Card border="secondary">
          <Card.Header style={{fontSize: "1.2rem" }}><strong>Map</strong></Card.Header>
          <Card.Body>
            <Container className="map-container" id="map">
              <Container className="map-controller">
                <Button className="map-button" variant='danger' onClick={() => this.setState({ command: 'SetGoal', message: 'Send goal to your robot' })}>Set Goal</Button>
                {/* <Button className="map-button" variant='outline-danger' onClick={() => this.setState({command: 'CancelGoal'})}>Cancel Goal</Button> */}
                <Button className="map-button" variant='success' onClick={() => this.setState({ command: 'AddStation', message: 'Add new station', stationName: 'NoName' })}>Add Station</Button>
                <Button className="map-button" variant='outline-success' onClick={() => this.setState({ command: 'DeleteStation', message: 'Click to delete station' })}>Delete Station</Button>
                <Button className="map-button" variant='warning' onClick={() => this.setState({ command: 'none', message: 'Robot is ready !' })}>Cancel</Button>
              </Container>
                <Container style={{ width: "28rem", height: "4rem" }}>
                  {this.state.command === 'AddStation' &&
                    <Form onChange={(event) => this.setState({stationName: event.target.value})}>
                      <Form.Group as={Row} controlId="formHorizontalEmail">
                        <Form.Label column sm={3}>
                          Station:
                        </Form.Label>
                        <Col sm={8}>
                          <Form.Control type="text" placeholder="ex: Table" />
                        </Col>
                      </Form.Group>
                    </Form>
                  }
                  {this.state.command !== 'AddStation' &&
                    <Alert variant="info">{this.state.message}</Alert>
                  }
                </Container>
              <Nav2d
                id='random'
                imageRobot={require('./jarvis.png')}
                imageGoalArrow={require('./arrow-red.png')}
                imageStationArrow={require('./arrow-green.png')}
                width={720}
                height={480}
                ros={this.ros}
                topic='/map'
                topic_costmap='/move_base_node/global_costmap/costmap'
                topic_path='/rtabmap/global_path'
                command={this.state.command}
                onSetGoal={(obj, pose) => this.onSetGoal(obj, pose)}
                onAddStation={(newStation) => this.onAddStation(newStation)}
                onClickStation={(station) => this.onClickStation(station)}
                stationName={this.state.stationName}
                station={this.state.stations}
              />
              <Container>
                <Button
                  variant="danger"
                  disabled={this.state.enableCancel ? false : true}
                  onClick={() => {
                    this.setState({command: 'CancelGoal', message: 'Assignment was canceled', enableCancel: false});
                    this.cancelAssignmentService.callService();
                  }}>
                  Cancel Assignment
                </Button>
              </Container>
            </Container>
          </Card.Body>
        </Card>
      </Container>
    )
  }
}

export default Map;