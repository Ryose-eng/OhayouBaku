import { useState, useEffect } from "react";
import VitalForm from "../components/VitalForm";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = "http://localhost/api";

const Dashboard = () => {
  const [vitals, setVitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const { user, token, logout, isCaregiver, hasCareRecipient } = useAuth();
  const navigate = useNavigate();
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [displayCount, setDisplayCount] = useState(7);

  useEffect(() => {
    if (user && isCaregiver && !hasCareRecipient) {
      setAuthError('チャットから被介護者との認証を行ってください');
    } else {
      setAuthError(null);
    }
  }, [user, isCaregiver, hasCareRecipient]);

  const fetchVitals = async () => {
    try {
      const response = await fetch(`${API_URL}/vitals`, {
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

      if (!response.ok) {
        throw new Error("データ取得に失敗しました");
      }

      const data = await response.json();
      setVitals(Array.isArray(data.vitals) ? data.vitals : []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      setVitals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVitalAdded = (newVital) => {
    // 新しいバイタルデータを追加する前にデータを整形
    const formattedVital = {
      ...newVital,
      created_at: new Date().toISOString(), // ISO形式の日付文字列を追加
    };
    
    setVitals(prevVitals => [formattedVital, ...prevVitals]);
    setShowVitalModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVitals();
  }, [user, navigate, token]);

  // グラフデータの整形
  const formatChartData = (vitalsData) => {
    return vitalsData.map(vital => ({
      date: new Date(vital.created_at).toLocaleDateString(),
      systolic: Number(vital.systolic),
      diastolic: Number(vital.diastolic),
      pulse: Number(vital.pulse),
      temperature: Number(vital.temperature),
      oxygen: Number(vital.oxygen),
    })).reverse(); // 古い順に表示
  };

  if (!user) {
    return null;
  }

  return (
    <AppContainer>
      <Header title="バイタル管理" onLogout={handleLogout} />
      <Sidebar user={user} />
      <MainContent>
        {authError ? (
          <AuthErrorContainer>
            <AuthErrorMessage>{authError}</AuthErrorMessage>
            <AuthErrorButton onClick={() => navigate('/chat/create')}>
              チャット認証へ進む
            </AuthErrorButton>
          </AuthErrorContainer>
        ) : (
          <>
            <Section>
              <SectionHeader>
                <SectionTitle>バイタルトレンド</SectionTitle>
                <AddVitalButton onClick={() => setShowVitalModal(true)}>
                  バイタル登録
                </AddVitalButton>
              </SectionHeader>
              <ChartContainer>
                {vitals.length > 0 ? (
                  <>
                    <ChartTitle>血圧・脈拍の推移</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatChartData(vitals)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="systolic" stroke="#ff4444" name="最高血圧" />
                        <Line type="monotone" dataKey="diastolic" stroke="#2196f3" name="最低血圧" />
                        <Line type="monotone" dataKey="pulse" stroke="#4caf50" name="脈拍" />
                      </LineChart>
                    </ResponsiveContainer>

                    <ChartTitle>体温・酸素濃度の推移</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatChartData(vitals)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="temp" domain={[35, 42]} />
                        <YAxis yAxisId="oxygen" orientation="right" domain={[80, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#ff9800" name="体温" yAxisId="temp" />
                        <Line type="monotone" dataKey="oxygen" stroke="#9c27b0" name="酸素濃度" yAxisId="oxygen" />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <NoDataMessage>グラフを表示するデータがありません</NoDataMessage>
                )}
              </ChartContainer>
            </Section>
            
            <Section>
              <SectionTitle>バイタル一覧</SectionTitle>
              <VitalsListContainer>
                {isLoading ? (
                  <LoadingText>読み込み中...</LoadingText>
                ) : vitals.length > 0 ? (
                  <>
                    <VitalsList>
                      {vitals.slice(0, displayCount).map((vital) => (
                        <VitalItem key={vital.id}>
                          <VitalHeader>
                            <VitalDate>{new Date(vital.created_at).toLocaleString()}</VitalDate>
                          </VitalHeader>
                          <VitalData>
                            <DataItem>血圧: {vital.systolic}/{vital.diastolic} mmHg</DataItem>
                            <DataItem>脈拍: {vital.pulse} bpm</DataItem>
                            <DataItem>体温: {vital.temperature}℃</DataItem>
                            <DataItem>SpO2: {vital.oxygen}%</DataItem>
                            <DataItem>気分: {vital.mood === "happy" ? "😊" : vital.mood === "neutral" ? "😑" : "😣"}</DataItem>
                            {vital.note && <DataNote>{vital.note}</DataNote>}
                          </VitalData>
                        </VitalItem>
                      ))}
                    </VitalsList>
                    {vitals.length > displayCount && (
                      <ShowMoreButton onClick={() => setDisplayCount(vitals.length)}>
                        もっと見る
                      </ShowMoreButton>
                    )}
                  </>
                ) : (
                  <NoDataMessage>バイタルデータがありません</NoDataMessage>
                )}
              </VitalsListContainer>
            </Section>
          </>
        )}
      </MainContent>
      <Footer />
      {showVitalModal && (
        <ModalOverlay>
          <Modal>
            <VitalForm 
              token={token} 
              onVitalAdded={handleVitalAdded}
              onClose={() => setShowVitalModal(false)}
            />
          </Modal>
        </ModalOverlay>
      )}
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background-color: #f0f8ff;
  color: #333;
`;

const MainContent = styled.main`
  grid-area: main;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin: 10px;
  border-radius: 8px;
`;

const Section = styled.section`
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: #0078a8;
  font-size: 1.5rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #b3e0ff;
`;

const VitalsListContainer = styled.div`
  margin-top: 20px;
`;

const VitalsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const VitalItem = styled.li`
  background-color: #e6f7ff;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const VitalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #b3e0ff;
`;

const VitalDate = styled.span`
  color: #0078a8;
  font-size: 0.9em;
`;

const VitalData = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
`;

const DataItem = styled.div`
  color: #0078a8;
  padding: 5px 0;
  font-size: 1.1em;
`;

const DataNote = styled.div`
  grid-column: 1 / -1;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  color: #0078a8;
  font-style: italic;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #0078a8;
  font-size: 1.1em;
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: #0078a8;
  font-style: italic;
  padding: 20px;
  background-color: #e6f7ff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ChartContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  color: #0078a8;
  font-size: 1.2rem;
  margin: 20px 0 10px;
  text-align: center;
`;

const AuthErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
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

const AddVitalButton = styled.button`
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ShowMoreButton = styled.button`
  display: block;
  width: 200px;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #0078a8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #006291;
  }
`;

export default Dashboard;
