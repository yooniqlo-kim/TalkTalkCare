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
  currentSessionId: string | undefined;
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
      currentSessionId: undefined,
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
    this.websocket = new WebSocket('wss://talktalkcare.com/openvidu');
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    
    const tryReconnect = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(() => {
                this.connectWebSocket();
                reconnectAttempts++;
            }, 2000);
        }
    };

    this.websocket.onopen = () => {
      console.log('OpenVidu 서버 연결 성공');
      this.setState({ isConnected: true });
    };

    this.websocket.onmessage = (event) => {
      console.log('OpenVidu 메시지 수신:', event.data);
      this.setState(prevState => ({
        wsMessages: [...prevState.wsMessages, event.data]
      }));
    };

    this.websocket.onerror = (error) => {
      console.error('OpenVidu 서버 에러:', error);
      this.setState({ isConnected: false });
    };

    this.websocket.onclose = () => {
        console.log('WebSocket 연결 종료');
        tryReconnect();
    };
  }

  handleMainVideoStream(stream: StreamManager) {
    if (this.state.mainStreamManager !== stream) {
      this.setState({ mainStreamManager: stream });
    }
  }

  async joinSession(sessionId: string) {
    try {
      // 기존 세션이 있으면 먼저 종료
      if (this.state.session) {
        await this.leaveSession();
      }

      // OpenVidu 객체 초기화
      this.OV = new OpenVidu();
      this.OV.enableProdMode();

      // 세션 초기화
      const session = this.OV.initSession();
      this.setState({ session });

      // 세션 이벤트 핸들러 설정
      session.on('streamCreated', (event) => {
        const subscriber = session.subscribe(event.stream, undefined);
        this.setState(prevState => ({
          subscribers: [...prevState.subscribers, subscriber]
        }));
      });

      // 토큰 생성
      const token = await this.getToken(sessionId);
      
      // 세션 연결
      await session.connect(token);

      // 퍼블리셔 초기화
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

      // 퍼블리셔 연결
      await session.publish(publisher);
      this.setState({
        mainStreamManager: publisher,
        publisher: publisher,
        currentSessionId: sessionId
      });

    } catch (error) {
      console.error('세션 참가 중 오류:', error);
      this.leaveSession();
    }
  }

  // 기존의 세션 생성 메서드 유지
  async createSession(sessionId: string) {
    return new Promise<string>(async (resolve) => {
        try {
            const response = await fetch('https://www.talktalkcare.com/openvidu/api/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa('OPENVIDUAPP:talktalkcare'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ customSessionId: sessionId }),
                credentials: 'include'
            });

            // 409 에러 (세션이 이미 존재)
            if (response.status === 409) {
                resolve(sessionId);
                return;
            }

            // 다른 에러 발생 시
            if (!response.ok) {
                // 1초 후 강제로 성공 처리
                setTimeout(() => {
                    console.log('타임아웃으로 인한 강제 세션 생성');
                    resolve(sessionId);
                }, 1000);
                return;
            }

            const data = await response.json();
            resolve(data.id);
        } catch (error) {
            console.error('세션 생성 중 에러:', error);
            resolve(sessionId);
        }
    });
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
    try {
        // 입력된 세션 ID가 없으면 새로운 세션 ID 생성
        const sessionId = this.state.sessionInput.trim() || `session-${Date.now()}`;
        await this.joinSession(sessionId);
        
        // 세션 ID를 상태에 저장
        this.setState({ 
            currentSessionId: sessionId,
            sessionInput: sessionId  // 생성된 세션 ID를 입력창에도 표시
        });
        
        // 새로 생성된 세션 ID를 알림
        if (!this.state.sessionInput.trim()) {
            alert(`새로운 세션이 생성되었습니다: ${sessionId}`);
        }
    } catch (error) {
        console.error('세션 참여 실패:', error);
        alert('세션 참여에 실패했습니다.');
    }
  }

  render() {
    return (
      <div className="container">
        <h1>화상 통화</h1>
        
        {/* 세션 정보 표시 - 상단에 고정 */}
        <div className="session-info-container">
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

          {this.state.currentSessionId && (
            <div className="current-session-info">
              <span>현재 세션: {this.state.currentSessionId}</span>
              <button onClick={() => {
                if (this.state.currentSessionId) {
                  navigator.clipboard.writeText(this.state.currentSessionId);
                  alert('세션 ID가 복사되었습니다!');
                }
              }}>
                세션 ID 복사
              </button>
            </div>
          )}
        </div>

        {/* 나머지 컨텐츠 */}
        <div className="video-content">
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
            {/* 메인 비디오 화면 - publisher가 없을 때만 표시 */}
            {this.state.mainStreamManager && !this.state.publisher && (
              <div className="main-video">
                <video autoPlay ref={video => {
                  if (video) {
                    this.state.mainStreamManager!.addVideoElement(video);
                  }
                }} />
              </div>
            )}

            <div className="secondary-videos">
              {/* 작은 화면들 */}
              {this.state.publisher && (
                <div className="video-box" onClick={() => this.handleMainVideoStream(this.state.publisher!)}>
                  <video autoPlay ref={video => {
                    if (video) {
                      this.state.publisher!.addVideoElement(video);
                    }
                  }} />
                </div>
              )}
              
              {/* 다른 참가자들 */}
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
      </div>
    );
  }
}

export default OpenViduTest;
