import { useState, useEffect } from "react";
import VitalForm from "../components/VitalForm";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const API_URL = "http://localhost/api";

const Dashboard = ({ token }) => {
  const [vitals, setVitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchVitals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/vitals`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("データ取得に失敗しました");
      }

      const data = await response.json();
      setVitals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("データ取得エラー:", error);
      setVitals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVitalAdded = (newVital) => {
    setVitals(prevVitals => [newVital, ...prevVitals]);
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

  if (!user) {
    return null;
  }

  return (
    <AppContainer>
      <Header title="バイタル管理" onLogout={handleLogout} />
      <Sidebar user={user} />
      <MainContent>
        <Section>
          <SectionTitle>バイタル登録</SectionTitle>
          <VitalForm token={token} onVitalAdded={handleVitalAdded} />
        </Section>
        
        <Section>
          <SectionTitle>バイタル一覧</SectionTitle>
          <VitalsListContainer>
            {isLoading ? (
              <LoadingText>読み込み中...</LoadingText>
            ) : vitals.length > 0 ? (
              <VitalsList>
                {vitals.map((vital) => (
                  <VitalItem key={vital.id}>
                    <VitalHeader>
                      <VitalDate>{new Date(vital.created_at).toLocaleString()}</VitalDate>
                    </VitalHeader>
                    <VitalData>
                      <DataItem>血圧: {vital.systolic}/{vital.diastolic} mmHg</DataItem>
                      <DataItem>脈拍: {vital.pulse} bpm</DataItem>
                      <DataItem>体温: {vital.temperature}℃</DataItem>
                      <DataItem>O2: {vital.oxygen}%</DataItem>
                      <DataItem>気分: {vital.mood === "happy" ? "😊" : vital.mood === "neutral" ? "😑" : "😣"}</DataItem>
                      {vital.note && <DataNote>{vital.note}</DataNote>}
                    </VitalData>
                  </VitalItem>
                ))}
              </VitalsList>
            ) : (
              <NoDataMessage>バイタルデータがありません</NoDataMessage>
            )}
          </VitalsListContainer>
        </Section>
      </MainContent>
      <Footer />
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

export default Dashboard;
