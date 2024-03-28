import { Row, Col } from 'antd';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import './App.css';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  Rate,
  Select,
} from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';


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
      
      // 限制文件数量和显示最新上传的文件
      fileList = fileList.slice(-1);

      // 读取响应并显示文件链接
      fileList = fileList.map(file => {
          if (file.response) {
              // 组件将根据此URL渲染图像
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
        console.error('Uploading file:', file);
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

  // 表单提交处理程序
  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表单默认提交事件

    const formData = {
      topic,
      description,
      wordCount,
      isLiveSearchEnabled,
    };

    try {
      // 发送POST请求
      const response = await axios.post('http://127.0.0.1:5000/generate-text', formData);
      console.log('Response:', response.data);
      setResponseText(response.data['result']); // 将响应文本存储到状态变量
    } catch (error) {
      console.error('Error:', error);
    }
  };


  // 新增：发布到小红书的处理程序
  const handlePublish = async () => {
    try {
      // 使用axios发送POST请求到另一个API
      const response = await axios.post('http://127.0.0.1:5000/post-social', {
        content: responseText,  // 这里发送TextArea中的内容
      });
      console.log('Published:', response.data);
      // 可以在这里设置一些发布后的状态反馈
    } catch (error) {
      console.error('Publish Error:', error);
      // 处理错误...
    }
  };
  
  return (
    <div className="App">
        <div style={{ padding: '20px' }}>
          {/* 标题 */}
          <Row justify="center">
            <h1 level={2}>社交平台自动化</h1>
          </Row>

          {/* 内容块 */}
          <Row justify="space-around" align="top" style={{ minHeight: '150px', marginTop: '20px' }}>
              <Col span={10} style={{ background: '#f0f2f5', textAlign: 'left', padding: '20px 50px' }}>
                    <>
                      <Form
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 14 }}
                        layout="horizontal"
                        style={{ maxWidth: 600 }}
                      >
                        <Form.Item label="输入主题">
                          <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="简要描述">
                          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
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
                            <Select.Option value="xiaohongshu">xiaohongshu</Select.Option>
                            <Select.Option value="zhihu">zhihu</Select.Option>
                            <Select.Option value="x">x</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label="文案字数">
                          <InputNumber min={100} max={1000} defaultValue={200} onChange={setWordCount}/>
                        </Form.Item>
                        <Form.Item label="开启实时搜索" valuePropName="checked">
                          <Switch checked={isLiveSearchEnabled} onChange={setIsLiveSearchEnabled} checkedChildren="开启" unCheckedChildren="关闭"/>
                        </Form.Item>
                        <Form.Item label="是否自动生图" valuePropName="checked">
                          <Switch checked={isGenPicEnabled} onChange={setIsGenPicEnabled} checkedChildren="开启" unCheckedChildren="关闭"/>
                        </Form.Item>
                        <Form.Item label="upload image" valuePropName="checked">
                        <Upload
                            customRequest={customRequest}
                            fileList={fileList}
                            onChange={handleChange}
                            beforeUpload={beforeUpload}
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                        </Form.Item>
                        <Form.Item label="预览内容">
                          <Button type='primary' onClick={handleSubmit}>生成文案</Button>
                        </Form.Item>
                        <Form.Item label="评价">
                          <Rate defaultValue={3} character={({ index }) => customIcons[index + 1]} />
                        </Form.Item>
                      </Form>
                    </>
              </Col>
          
              <Col span={10} style={{ background: '#f0f2f5', textAlign: 'center', padding: '20px 50px' }}>
                  <TextArea rows={23} placeholder="文案" value={responseText} onChange={(e) => setResponseText(e.target.value)} />
              </Col>
            </Row>

            {/* 底部按钮 */}
            <Row justify="center" style={{ marginTop: '20px' }}>
              <Col>
            <Button type="primary" onClick={handlePublish}>Publish to { selectedPlatform }</Button>
              </Col>
            </Row>
        </div>
    </div>
  );
}

export default App;
