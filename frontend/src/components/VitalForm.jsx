import { useState } from "react";
import styled from 'styled-components';

const API_URL = "http://localhost/api"; // LaravelのAPIエンドポイント

const VitalForm = ({ token, onVitalAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vital, setVital] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    temperature: "",
    oxygen: "",
    mood: "happy",
    note: "",
  });

  // バイタルデータを送信
  const createVital = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/vitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const newVital = await response.json();
        onVitalAdded(newVital);  // 新しいバイタルデータを親コンポーネントに渡す
        // フォームをリセット
        setVital({
          systolic: "",
          diastolic: "",
          pulse: "",
          temperature: "",
          oxygen: "",
          mood: "happy",
          note: "",
        });
      } else {
        throw new Error("登録に失敗しました");
      }
    } catch (error) {
      console.error("エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 入力フォームの変更をハンドル
  const handleChange = (e) => {
    setVital({ ...vital, [e.target.name]: e.target.value });
  };

  // フォーム送信処理
  const handleSubmit = (e) => {
    e.preventDefault();
    createVital(vital);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label>
          最高血圧:
          <Input
            type="number"
            name="systolic"
            value={vital.systolic}
            onChange={handleChange}
            required
          />
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          最低血圧:
          <Input
            type="number"
            name="diastolic"
            value={vital.diastolic}
            onChange={handleChange}
            required
          />
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          脈拍:
          <Input
            type="number"
            name="pulse"
            value={vital.pulse}
            onChange={handleChange}
            required
          />
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          体温:
          <Input
            type="number"
            step="0.1"
            name="temperature"
            value={vital.temperature}
            onChange={handleChange}
            required
          />
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          O2濃度:
          <Input
            type="number"
            name="oxygen"
            value={vital.oxygen}
            onChange={handleChange}
            required
          />
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          気分:
          <Select name="mood" value={vital.mood} onChange={handleChange}>
            <option value="happy">😊</option>
            <option value="neutral">😑</option>
            <option value="sad">😣</option>
          </Select>
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          メモ:
          <TextArea 
            name="note" 
            value={vital.note} 
            onChange={handleChange}
          />
        </Label>
      </FormGroup>

      <SubmitButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "登録中..." : "登録"}
      </SubmitButton>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  background-color: #e6f7ff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #0078a8;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #b3e0ff;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #0078a8;
    box-shadow: 0 0 5px rgba(0, 120, 168, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #b3e0ff;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #0078a8;
    box-shadow: 0 0 5px rgba(0, 120, 168, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #b3e0ff;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #0078a8;
    box-shadow: 0 0 5px rgba(0, 120, 168, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: #0078a8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #006291;
  }

  &:disabled {
    background-color: #b3e0ff;
    cursor: not-allowed;
  }
`;

export default VitalForm;
