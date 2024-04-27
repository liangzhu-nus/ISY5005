import React, { useState } from 'react';
import { Row, Col, Button, Form, Input, InputNumber, Switch, Rate, Select, Upload, message } from 'antd';
import { UploadOutlined, InboxOutlined, FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import axios from 'axios';

const { TextArea } = Input;

function App() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [wordCount, setWordCount] = useState(200);
  const [isLiveSearchEnabled, setIsLiveSearchEnabled] = useState(true);
  const [isGenPicEnabled, setIsGenPicEnabled] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('xiaohongshu');
  const [selectedStyle, setSelectedStyle] = useState('tech');
  const [fileList, setFileList] = useState([]);

  const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    return isJpgOrPng;
  };

  const handleChange = (info) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
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

    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-text', formData);
      setResponseText(response.data['result']);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePublish = async () => {
    if (responseText === '') {
      message.error('Content is empty!');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/post-social', {
        content: responseText,
        topic: topic,
        platform: selectedPlatform,
      });

      console.log('Published:', response.data);
    } catch (error) {
      console.error('Publish Error:', error);
    }
  };

  return (
    <div className="App" style={{ padding: '20px' }}>
      <Row justify="center" style={{ marginBottom: '20px' }}>
        <h1>社交平台自动化</h1>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item label="输入主题">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Form.Item>
            <Form.Item label="简要描述">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Item>
            <Form.Item label="文章风格">
              <Select value={selectedStyle} onChange={setSelectedStyle}>
                <Select.Option value="none">无</Select.Option>
                <Select.Option value="tech">专业技术向</Select.Option>
                <Select.Option value="life">生活化</Select.Option>
                <Select.Option value="entertainment">娱乐化</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="发布平台">
              <Select value={selectedPlatform} onChange={setSelectedPlatform}>
                <Select.Option value="xiaohongshu">Xiaohongshu</Select.Option>
                <Select.Option value="zhihu">Zhihu</Select.Option>
                <Select.Option value="x">X(Twitter)</Select.Option>
                <Select.Option value="weibo">Weibo</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="文案字数">
              <InputNumber min={100} max={1000} value={wordCount} onChange={setWordCount} />
            </Form.Item>
            <Form.Item label="开启实时搜索" valuePropName="checked">
              <Switch checked={isLiveSearchEnabled} onChange={setIsLiveSearchEnabled} checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item label="是否自动生图" valuePropName="checked">
              <Switch checked={isGenPicEnabled} onChange={setIsGenPicEnabled} checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item label="Upload Image">
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
                    <Button icon={<InboxOutlined />} style={{ color: '#1890ff', fontSize: '24px' }} />
                    <div style={{ marginTop: '8px', color: '#1890ff', fontSize: '16px' }}>Click or drag file to upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">生成文案</Button>
            </Form.Item>
            <Form.Item label="评价">
              <Rate character={({ index }) => customIcons[index + 1]} />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <TextArea rows={24} placeholder="文案" value={responseText} style={{ height: '90%' }} />
          <Button type="primary" onClick={handlePublish} style={{ marginTop: '10px' }}>发布到{selectedPlatform}</Button>
        </Col>
      </Row>
    </div>
  );
}

export default App;
