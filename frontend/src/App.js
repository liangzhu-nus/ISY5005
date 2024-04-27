import React, { useState } from 'react';
import { Row, Col, Button, Form, Input, InputNumber, Switch, Rate, Select, Upload, message } from 'antd';
import { UploadOutlined, FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import axios from 'axios';

const { TextArea } = Input;

function App() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [wordCount, setWordCount] = useState(200);
  const [isLiveSearchEnabled, setIsLiveSearchEnabled] = useState(false);
  const [isGenPicEnabled, setIsGenPicEnabled] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('xiaohongshu');
  const [selectedStyle, setSelectedStyle] = useState('tech');
  const [fileList, setFileList] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  const platformMap = {
    'xiaohongshu': 'Xiaohongshu',
    'weibo': 'Weibo',
    'zhihu': 'Zhihu',
    'x': 'X (Twitter)'
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    return isJpgOrPng;
  };

  const handlePlatformChange =  (value) => {
    setSelectedPlatform(value);

    if (value === 'x') {
      setWordCount(30);
      return;
    }
    setWordCount(200);
  };

  const handleChange = (info) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
        file.name = file.response.filename;
      }
      return file;
    });
    setFileList(fileList);
  };

  const customRequest = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        onUploadProgress: ({ total, loaded }) => {
          onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
        },
      });

      onSuccess(response.data, file);
    } catch (error) {
      onError({ error });
      message.error('Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      topic,
      description,
      wordCount,
      isLiveSearchEnabled,
      selectedStyle,
      selectedPlatform,
    };

    setIsGenerating(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-text', formData);
      setResponseText(response.data['result']);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (responseText === '') {
      message.error('Content is empty!');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/post-social', {
        content: responseText,
        topic: topic,
        platform: selectedPlatform,
        filename: fileList.length > 0 ? fileList[0].name : ''
      });

      console.log('Published:', response.data);
    } catch (error) {
      console.error('Publish Error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="App" style={{ padding: '30px 80px' }}>
      <Row justify="center" style={{ marginBottom: '20px' }}>
        <h1>Creator Automatic Assistant</h1>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item label="Theme">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Form.Item>
            <Form.Item label="Brief description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Item>
            <Form.Item label="Article style">
              <Select value={selectedStyle} onChange={setSelectedStyle}>
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="tech">Tech</Select.Option>
                <Select.Option value="life">Life</Select.Option>
                <Select.Option value="entertainment">Entertainment</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Platform to publish">
              <Select value={selectedPlatform} onChange={handlePlatformChange}>
                <Select.Option value="xiaohongshu">Xiaohongshu</Select.Option>
                <Select.Option value="zhihu">Zhihu</Select.Option>
                <Select.Option value="x">X (Twitter)</Select.Option>
                <Select.Option value="weibo">Weibo</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Preferred word count">
              <InputNumber min={30} max={1000} value={wordCount} onChange={setWordCount} />
            </Form.Item>
            <Form.Item label="Enable live searching" valuePropName="checked">
              <Switch checked={isLiveSearchEnabled} onChange={setIsLiveSearchEnabled} checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item label="Enable image generating" valuePropName="checked">
              <Switch checked={isGenPicEnabled} onChange={setIsGenPicEnabled} checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item label="Upload image">
              <Upload
                customRequest={customRequest}
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                listType="picture-card"
              >
                {fileList.length >= 1 ? null : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '120px', border: '2px dashed #1890ff', borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <Button icon={<UploadOutlined />} style={{ color: '#1890ff', fontSize: '24px' }} />
                    <div style={{ marginTop: '8px', color: '#1890ff', fontSize: '16px' }}>Click or drag file to upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isGenerating}>Generate article</Button>
            </Form.Item>
            <Form.Item label="Feedback">
              <Rate character={({ index }) => customIcons[index + 1]} />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <TextArea rows={25} placeholder="Article content" value={responseText} style={{ height: '90%', marginBottom: '20px' }} />
          <Button type="primary" size="large" shape="round" onClick={handlePublish} loading={isPublishing}>Publish to {platformMap[selectedPlatform]}</Button>
        </Col>
      </Row>
    </div>
  );
}

export default App;
