import { Component } from 'react';
import { Device, OpenVidu, Publisher, Session, StreamManager, Subscriber } from 'openvidu-browser';
import './OpenViduTest.css';

interface State {
  session: Session | undefined;
  mainStreamManager: StreamManager | undefined;
  publisher: Publisher | undefined;
  subscribers: Subscriber[];
  currentVideoDevice: Device | undefined;
  wsMessages: string[];  // 웹소켓 메시지 유지
  isConnected: boolean;  // 연결 상태 유지
  sessionInput: string;  // 세션 ID 입력값
}

class OpenViduTest extends Component<{}, State> {
  private OV: OpenVidu | undefined;
  private websocket: WebSocket | undefined;  // 웹소켓 연결 유지

  constructor(props: {}) {
    super(props);
    this.state = {
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      subscribers: [],
      currentVideoDevice: undefined,
      wsMessages: [],
      isConnected: false,
      sessionInput: '',
    };

    this.joinSession = this.joinSession.bind(this);
    this.leaveSession = this.leaveSession.bind(this);
    this.switchCamera = this.switchCamera.bind(this);
    this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.leaveSession);
    this.connectWebSocket();  // 웹소켓 연결 설정
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.leaveSession);
    this.leaveSession();
    if (this.websocket) {
      this.websocket.close();
    }
  }

  // 웹소켓 연결 설정
  connectWebSocket() {
    this.websocket = new WebSocket('wss://www.talktalkcare.com/ws/signal');

    this.websocket.onopen = () => {
      console.log('시그널링 서버 연결 성공');
    };

    this.websocket.onmessage = (event) => {
      console.log('시그널링 메시지 수신:', event.data);
      this.setState(prevState => ({
        wsMessages: [...prevState.wsMessages, event.data]
      }));
    };

    this.websocket.onerror = (error) => {
      console.error('시그널링 서버 에러:', error);
    };

    this.websocket.onclose = () => {
      console.log('시그널링 서버 연결 종료');
    };
  }

  handleMainVideoStream(stream: StreamManager) {
    if (this.state.mainStreamManager !== stream) {
      this.setState({ mainStreamManager: stream });
    }
  }

  async joinSession(sessionId: string) {
    try {
      // 세션 생성/참여
      const token = await this.getToken(sessionId);
      
      this.OV = new OpenVidu();
      this.OV.enableProdMode();

      const session = this.OV.initSession();
      this.setState({ session });

      session.on('streamCreated', (event) => {
        const subscriber = session.subscribe(event.stream, undefined);
        this.setState(prevState => ({
          subscribers: [...prevState.subscribers, subscriber]
        }));
      });

      session.on('streamDestroyed', (event) => {
        this.setState(prevState => ({
          subscribers: prevState.subscribers.filter(sub => sub !== event.stream.streamManager)
        }));
      });

      session.on('connectionCreated', () => {
        this.setState({ isConnected: true });
        console.log('OpenVidu 연결됨');
      });

      try {
        await session.connect(token);

        const publisher = await this.OV.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false
        });

        session.publish(publisher);

        // 현재 사용 중인 비디오 장치 확인
        const devices = await this.OV.getDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const currentVideoDeviceId = publisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
        const currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

        this.setState({
          currentVideoDevice,
          mainStreamManager: publisher,
          publisher
        });

      } catch (error) {
        console.error('세션 연결 에러:', error);
      }
    } catch (error) {
      console.error('세션 참여 에러:', error);
    }
  }

  // 기존의 세션 생성 메서드 유지
  async createSession(sessionId: string) {
    try {
      const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
        },
        body: JSON.stringify({ customSessionId: sessionId })
      });

      if (response.status === 409) {
        return sessionId;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('세션 생성 에러:', error);
      throw error;
    }
  }

  // 기존의 토큰 생성 메서드 유지
  async createToken(sessionId: string) {
    try {
      const response = await fetch(`https://www.talktalkcare.com/openvidu/api/sessions/${sessionId}/connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare')
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('토큰 생성 에러:', error);
      throw error;
    }
  }

  async getToken(sessionId: string) {
    // 세션 생성 시도
    const sid = await this.createSession(sessionId);
    // 토큰 생성
    return await this.createToken(sid);
  }

  leaveSession() {
    if (this.state.session) {
      this.state.session.disconnect();
    }
    document.querySelectorAll('video').forEach(video => {
      video.srcObject = null;
    });

    this.OV = undefined;
    this.setState({
      session: undefined,
      subscribers: [],
      mainStreamManager: undefined,
      publisher: undefined
    });
  }

  async switchCamera() {
    try {
      if (!this.OV) return;

      const devices = await this.OV.getDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length > 1) {
        const newVideoDevice = videoDevices.find(
          device => device.deviceId !== this.state.currentVideoDevice?.deviceId
        );

        if (newVideoDevice && this.state.session) {
          const newPublisher = this.OV.initPublisher(undefined, {
            videoSource: newVideoDevice.deviceId,
            publishAudio: true,
            publishVideo: true,
            mirror: true
          });

          await this.state.session.unpublish(this.state.mainStreamManager as Publisher);
          await this.state.session.publish(newPublisher);

          this.setState({
            currentVideoDevice: newVideoDevice,
            mainStreamManager: newPublisher,
            publisher: newPublisher
          });
        }
      }
    } catch (error) {
      console.error('카메라 전환 에러:', error);
    }
  }

  // 세션 ID 입력 처리
  handleSessionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ sessionInput: e.target.value });
  }

  // 세션 참여 처리
  handleJoinSession = async () => {
    const sessionId = this.state.sessionInput || `session-${Date.now()}`;  // 고유한 세션 ID 생성
    await this.joinSession(sessionId);
  }

  render() {
    return (
      <div className="container">
        <h1>화상 통화</h1>
        
        {/* 세션 입력 및 참여 UI - 항상 표시 */}
        <div className="session-form">
          <input
            type="text"
            placeholder="세션 ID를 입력하세요"
            value={this.state.sessionInput}
            onChange={this.handleSessionInput}
          />
          <button onClick={this.handleJoinSession}>
            {this.state.session ? '다른 세션 참여' : '세션 참여'}
          </button>
        </div>

        {/* 현재 세션 정보 표시 */}
        {this.state.session?.sessionId && (
          <div className="session-info">
            현재 세션: {this.state.session.sessionId}
            <button onClick={() => {
              navigator.clipboard.writeText(this.state.session!.sessionId);
              alert('세션 ID가 복사되었습니다!');
            }}>
              세션 ID 복사
            </button>
          </div>
        )}

        <div className="connection-status">
          OpenVidu 연결 상태: {this.state.isConnected ? '연결됨' : '연결 안됨'}
        </div>

        <div className="button-container">
          {!this.state.session ? (
            <button onClick={() => this.joinSession('test-session')}>세션 참여</button>
          ) : (
            <>
              <button onClick={this.leaveSession}>세션 나가기</button>
              <button onClick={this.switchCamera}>카메라 전환</button>
            </>
          )}
        </div>

        <div className="video-container">
          {this.state.mainStreamManager && (
            <div className="main-video">
              <video autoPlay ref={video => {
                if (video) {
                  this.state.mainStreamManager!.addVideoElement(video);
                }
              }} />
            </div>
          )}

          <div className="secondary-videos">
            {this.state.publisher && (
              <div className="video-box" onClick={() => this.handleMainVideoStream(this.state.publisher!)}>
                <video autoPlay ref={video => {
                  if (video) {
                    this.state.publisher!.addVideoElement(video);
                  }
                }} />
              </div>
            )}
            
            {this.state.subscribers.map((sub, i) => (
              <div key={i} className="video-box" onClick={() => this.handleMainVideoStream(sub)}>
                <video autoPlay ref={video => {
                  if (video) {
                    sub.addVideoElement(video);
                  }
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* 웹소켓 메시지 표시 영역 유지 */}
        <div className="signaling-messages">
          <h3>시그널링 메시지</h3>
          {this.state.wsMessages.map((msg, index) => (
            <div key={index} className="message">{msg}</div>
          ))}
        </div>
      </div>
    );
  }
}

export default OpenViduTest;
