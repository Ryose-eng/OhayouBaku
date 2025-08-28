import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import jaLocale from '@fullcalendar/core/locales/ja';
import moment from 'moment';
import Modal from 'react-modal';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';

// Modalのスタイリング
const StyledModal = styled(Modal)`
  &.ReactModal__Content {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

// アプリケーションのルート要素を設定
Modal.setAppElement('#root');

const CalendarPage = () => {
  const { user, token, logout, isCaregiver, hasCareRecipient } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    allDay: true
  });
  const calendarRef = React.useRef(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [showTodoInput, setShowTodoInput] = useState(false);
  const [detailModalIsOpen, setDetailModalIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user && isCaregiver && !hasCareRecipient) {
      setAuthError('チャットから被介護者との認証を行ってください');
    } else {
      setAuthError(null);
      fetchEvents();
      fetchTodos();
    }
  }, [user, isCaregiver, hasCareRecipient, navigate]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data.needsAuth) {
          setAuthError('チャットから被介護者との認証を行ってください');
          return;
        }
      }

      const data = await response.json();
      const formattedEvents = data.map(event => {
        if (event.all_day) {
          // 終日イベントの場合、endを次の日の00:00:00に設定
          return {
            ...event,
            start: moment(event.start).format('YYYY-MM-DD'),
            end: moment(event.end).add(1, 'days').format('YYYY-MM-DD'),
            allDay: true
          };
        } else {
          // 時間指定イベントの場合
          return {
            ...event,
            start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
            end: moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
            allDay: false
          };
        }
      });
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    const view = selectInfo.view.type;
    let defaultStart = selectInfo.start;
    let defaultEnd = selectInfo.end;
    let isAllDay = true;  // デフォルトは終日

    // timeGridView（日・週表示）での選択時
    if (view.includes('timeGrid')) {
      isAllDay = false;  // 時間指定ビューでの選択は時間指定モードをデフォルトに
    } else {
      // 月表示での選択時は終了日を1日前に（次の日までまたがないように）
      defaultEnd = moment(defaultEnd).subtract(1, 'days').toDate();
    }

    setNewEvent({
      title: '',
      description: '',
      start: defaultStart,
      end: defaultEnd,
      allDay: isAllDay
    });
    setModalIsOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay
    });
    setDetailModalIsOpen(true);
  };

  const handleEventDrop = async (dropInfo) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${dropInfo.event.id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          start: dropInfo.event.startStr,
          end: dropInfo.event.endStr
        }),
      });

      if (!response.ok) {
        dropInfo.revert();
        throw new Error("イベントの更新に失敗しました");
      }
    } catch (error) {
      console.error("イベントの更新エラー:", error);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      let formattedStart, formattedEnd;

      if (newEvent.allDay) {
        // 終日イベントの場合
        formattedStart = moment(newEvent.start).format('YYYY-MM-DD');
        formattedEnd = moment(newEvent.end).format('YYYY-MM-DD');
      } else {
        // 時間指定イベントの場合
        formattedStart = moment(newEvent.start).format('YYYY-MM-DD HH:mm:ss');
        formattedEnd = moment(newEvent.end).format('YYYY-MM-DD HH:mm:ss');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          start: formattedStart,
          end: formattedEnd,
          all_day: newEvent.allDay
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "イベントの追加に失敗しました");
      }

      const data = await response.json();
      
      // 新しいイベントを追加
      const newEventObj = newEvent.allDay ? {
        ...data,
        start: moment(data.start).format('YYYY-MM-DD'),
        end: moment(data.end).add(1, 'days').format('YYYY-MM-DD'),
        allDay: true
      } : {
        ...data,
        start: moment(data.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment(data.end).format('YYYY-MM-DD HH:mm:ss'),
        allDay: false
      };
      
      setEvents(prevEvents => [...prevEvents, newEventObj]);
      setModalIsOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: true
      });
    } catch (error) {
      console.error("イベントの追加エラー:", error);
      alert(error.message);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("イベントの削除に失敗しました");
      }

      // カレンダーのイベントを直接更新
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const eventToRemove = calendarApi.getEventById(eventId);
        if (eventToRemove) {
          eventToRemove.remove();
        }
      }

      // stateも更新
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      setSelectedEvent(null);
      setDetailModalIsOpen(false);
    } catch (error) {
      console.error("イベントの削除エラー:", error);
      alert(error.message);
    }
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Todoの取得に失敗しました');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Todoの取得エラー:', error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodoTitle }),
      });

      if (!response.ok) {
        throw new Error('Todoの追加に失敗しました');
      }

      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
      setShowTodoInput(false);
    } catch (error) {
      console.error('Todoの追加エラー:', error);
      alert(error.message);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error('Todoの更新に失敗しました');
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed } : todo
      ));
    } catch (error) {
      console.error('Todoの更新エラー:', error);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Todoの削除に失敗しました');
      }

      setTodos(todos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error('Todoの削除エラー:', error);
      alert(error.message);
    }
  };

  // 認証エラーがある場合は早期リターン
  if (authError) {
    return (
      <AppContainer>
        <Header title="カレンダー" onLogout={logout} />
        <Sidebar user={user} />
        <MainContent>
          <AuthErrorContainer>
            <AuthErrorMessage>{authError}</AuthErrorMessage>
            <AuthErrorButton onClick={() => navigate('/chat/create')}>
              チャット認証へ進む
            </AuthErrorButton>
          </AuthErrorContainer>
        </MainContent>
        <Footer />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header title="カレンダー" onLogout={logout} />
      <Sidebar user={user} />
      <MainContent>
        <CalendarContainer>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayHeaderFormat: { weekday: 'short' }
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayHeaderFormat: { 
                  weekday: 'short',
                  day: 'numeric',
                  omitCommas: true
                }
              },
              timeGridDay: {
                titleFormat: { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                },
                dayHeaderFormat: { 
                  day: 'numeric',
                  weekday: 'short',
                  omitCommas: true
                }
              }
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventDrop}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            locale={jaLocale}
            timeZone='Asia/Tokyo'
            allDaySlot={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '09:00',
              endTime: '17:00',
            }}
          />
        </CalendarContainer>

        <TodoContainer>
          <TodoHeader>
            <h3>Todoリスト</h3>
            <AddTodoButton onClick={() => setShowTodoInput(true)}>
              ＋ 新規Todo
            </AddTodoButton>
          </TodoHeader>
          
          {showTodoInput && (
            <TodoForm onSubmit={handleAddTodo}>
              <TodoInput
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="新しいTodoを入力"
              />
              <TodoButtonGroup>
                <TodoSubmitButton type="submit">追加</TodoSubmitButton>
                <TodoCancelButton type="button" onClick={() => {
                  setShowTodoInput(false);
                  setNewTodoTitle('');
                }}>
                  キャンセル
                </TodoCancelButton>
              </TodoButtonGroup>
            </TodoForm>
          )}

          <TodoList>
            {todos.map(todo => (
              <TodoItem key={todo.id}>
                <TodoCheckbox>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                  />
                  <TodoText completed={todo.completed}>{todo.title}</TodoText>
                </TodoCheckbox>
                <DeleteTodoButton onClick={() => deleteTodo(todo.id)}>
                  <FaTrash />
                </DeleteTodoButton>
              </TodoItem>
            ))}
          </TodoList>
        </TodoContainer>

        <EventModal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          event={newEvent}
          setEvent={setNewEvent}
          onSubmit={handleEventSubmit}
          title="新規イベント作成"
        />

        <EventDetailModal
          isOpen={detailModalIsOpen}
          onRequestClose={() => {
            setDetailModalIsOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onDelete={deleteEvent}
        />
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

// スタイリングコンポーネント
const AppContainer = styled.div`
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  grid-area: main;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 10px;
  border-radius: 8px;
  position: relative;
`;

const CalendarContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  height: calc(80vh - 40px); /* カレンダーの高さを調整 */

  .fc {
    height: 100%; /* FullCalendarを親要素にフィット */
    --fc-border-color: #e5e5e5;
    --fc-button-bg-color: #1a73e8;
    --fc-button-border-color: #1a73e8;
    --fc-button-hover-bg-color: #1557b0;
    --fc-button-hover-border-color: #1557b0;
    --fc-today-bg-color: #e8f0fe;
  }

  .fc-button {
    text-transform: none;
    font-weight: 500;
  }

  .fc-event {
    cursor: pointer;
    border: none;
    padding: 2px 4px;
  }

  .fc-daygrid-event {
    border-radius: 4px;
  }

  /* 曜日の色設定 */
  .fc-day-sun {
    color: #dc3545; /* 日曜日 - 赤 */
  }

  .fc-day-sat {
    color: #1a73e8; /* 土曜日 - 青 */
  }

  /* ヘッダーの曜日の色設定 */
  .fc-col-header-cell-cushion {
    color: #333; /* デフォルト - 黒 */
  }

  .fc-day-sun .fc-col-header-cell-cushion {
    color: #dc3545; /* 日曜日 - 赤 */
  }

  .fc-day-sat .fc-col-header-cell-cushion {
    color: #1a73e8; /* 土曜日 - 青 */
  }

  /* 日付の色設定 */
  .fc-daygrid-day-number {
    color: #333; /* デフォルト - 黒 */
  }

  .fc-day-sun .fc-daygrid-day-number {
    color: #dc3545; /* 日曜日 - 赤 */
  }

  .fc-day-sat .fc-daygrid-day-number {
    color: #1a73e8; /* 土曜日 - 青 */
  }

  /* 時間軸のスタイリング改善 */
  .fc-timegrid-slot-label {
    font-size: 0.9em;
    color: #666;
    padding: 4px;
    width: 65px;
    text-align: right;
  }

  /* 時間軸の背景色 */
  .fc-timegrid-axis {
    background-color: #f8f9fa;
    border-right: 1px solid #ddd;
  }

  /* ヘッダーのスタイリング */
  .fc-toolbar-title {
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
  }

  /* カラムヘッダーのスタイリング */
  .fc-col-header-cell {
    padding: 8px;
    background: #f8f9fa;
    font-weight: bold;
  }

  /* 時間区切り線 */
  .fc-timegrid-slot {
    border-color: #eee;
  }

  /* 現在時刻の線 */
  .fc-timegrid-now-indicator-line {
    border-color: #ff3b30;
  }

  /* 業務時間の背景色 */
  .fc-non-business {
    background: #f8f9fa;
  }
`;

const TodoContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-top: 20px;
  padding: 20px;
`;

const TodoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    color: #1a73e8;
  }
`;

const AddTodoButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #1557b0;
  }
`;

const TodoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TodoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: #f1f3f4;
  }
`;

const TodoText = styled.span`
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? '#666' : '#333'};
`;

const TodoForm = styled.form`
  margin-bottom: 16px;
`;

const TodoInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const TodoButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const TodoSubmitButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #1557b0;
  }
`;

const TodoCancelButton = styled.button`
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const TodoCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
  cursor: pointer;
`;

const DeleteTodoButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;

const EventModal = ({ isOpen, onRequestClose, event, setEvent, onSubmit, title }) => (
  <StyledModal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    style={customModalStyles}
  >
    <ModalContent>
      <ModalHeader>
        <h2>{title}</h2>
        <CloseButton onClick={onRequestClose}>×</CloseButton>
      </ModalHeader>
      <ModalBody>
        <form onSubmit={onSubmit}>
          <FormGroup>
            <label>タイトル</label>
            <input
              type="text"
              value={event?.title || ''}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              required
              placeholder="イベントのタイトル"
            />
          </FormGroup>
          <FormGroup>
            <label>説明</label>
            <textarea
              value={event?.description || ''}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              placeholder="イベントの説明"
              rows={4}
            />
          </FormGroup>
          <FormGroup>
            <label>
              <input
                type="checkbox"
                checked={event?.allDay || false}
                onChange={(e) => {
                  const isAllDay = e.target.checked;
                  let newStart = event.start;
                  let newEnd = event.end;
                  
                  if (isAllDay) {
                    // 終日に変更時は時間をリセット
                    newStart = moment(newStart).startOf('day').toDate();
                    newEnd = moment(newEnd).endOf('day').toDate();
                  } else {
                    // 時間指定に変更時はデフォルト時間を設定
                    newStart = moment(newStart).hour(9).minute(0).toDate();
                    newEnd = moment(newStart).hour(18).minute(0).toDate();
                  }
                  
                  setEvent({
                    ...event,
                    allDay: isAllDay,
                    start: newStart,
                    end: newEnd
                  });
                }}
              />
              終日
            </label>
          </FormGroup>
          {!event?.allDay && (
            <>
              <FormGroup>
                <label>開始時間</label>
                <input
                  type="datetime-local"
                  value={moment(event?.start).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setEvent({ ...event, start: new Date(e.target.value) })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>終了時間</label>
                <input
                  type="datetime-local"
                  value={moment(event?.end).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setEvent({ ...event, end: new Date(e.target.value) })}
                  required
                />
              </FormGroup>
            </>
          )}
          <ButtonGroup>
            <SubmitButton type="submit">保存</SubmitButton>
            <CancelButton type="button" onClick={onRequestClose}>
              キャンセル
            </CancelButton>
          </ButtonGroup>
        </form>
      </ModalBody>
    </ModalContent>
  </StyledModal>
);

const EventDetailModal = ({ isOpen, onRequestClose, event, onDelete }) => (
  <StyledModal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    style={customModalStyles}
  >
    <ModalContent>
      <ModalHeader>
        <h2>イベント詳細</h2>
        <CloseButton onClick={onRequestClose}>×</CloseButton>
      </ModalHeader>
      <ModalBody>
        {event && (
          <EventDetails>
            <EventTitle>{event.title}</EventTitle>
            <EventTime>
              {event.allDay ? (
                moment(event.start).format('YYYY年MM月DD日')
              ) : (
                <>
                  {moment(event.start).format('YYYY年MM月DD日 HH:mm')} - 
                  {moment(event.end).format('YYYY年MM月DD日 HH:mm')}
                </>
              )}
            </EventTime>
            {event.description && (
              <EventDescription>{event.description}</EventDescription>
            )}
            <ButtonGroup>
              <DeleteButton onClick={async () => {
                await onDelete(event.id);
                onRequestClose(); // モーダルを閉じる
              }}>
                <FaTrash /> 削除
              </DeleteButton>
            </ButtonGroup>
          </EventDetails>
        )}
      </ModalBody>
    </ModalContent>
  </StyledModal>
);

// モーダルのスタイル設定
const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '500px',
    width: '90%',
    padding: '0',
    border: 'none',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'visible'
  }
};

// 追加のスタイリングコンポーネント
const ModalContent = styled.div`
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;

  h2 {
    margin: 0;
    color: #1a73e8;
    font-size: 1.5rem;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
  }

  input[type="text"],
  input[type="datetime-local"],
  textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #1a73e8;
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
    }
  }

  input[type="checkbox"] {
    margin-right: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const SubmitButton = styled(Button)`
  background-color: #1a73e8;
  color: white;
  border: none;

  &:hover {
    background-color: #1557b0;
  }
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #1a73e8;
  border: 1px solid #1a73e8;

  &:hover {
    background-color: #f1f3f4;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #c82333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const EventDetails = styled.div`
  color: #333;
`;

const EventTitle = styled.h3`
  margin: 0 0 12px;
  color: #1a73e8;
  font-size: 1.3rem;
`;

const EventTime = styled.div`
  color: #666;
  margin-bottom: 16px;
`;

const EventDescription = styled.p`
  margin: 16px 0;
  white-space: pre-wrap;
`;

// 新しいスタイルコンポーネントを追加
const AuthErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  max-width: 400px;
`;

const AuthErrorMessage = styled.p`
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;

const AuthErrorButton = styled.button`
  background-color: #0078a8;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #005f85;
  }
`;

export default CalendarPage; 