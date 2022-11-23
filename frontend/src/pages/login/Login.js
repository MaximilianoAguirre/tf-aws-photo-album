import React from "react"
import { Form, Input, Button } from "antd"
import { LoginOutlined, QuestionCircleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

import { useAuth } from "context/auth"

export const Login = () => {
    const { login, isAuthenticating } = useAuth()
    const navigate = useNavigate()
    const [form] = Form.useForm()

    return <Form
        name="login"
        form={form}
        onFinish={(values) => login(values)}
    >
        <Form.Item
            label="User"
            name="username"
            hasFeedback
            rules={[
                { required: true },
                { type: "email" }
            ]}
        >
            <Input prefix={<UserOutlined />} autoComplete="email" autoFocus />
        </Form.Item>
        <Form.Item
            label="Password"
            name="password"
            hasFeedback
            rules={[
                { required: true }
            ]}
        >
            <Input.Password prefix={<LockOutlined />} autoComplete="password" />
        </Form.Item>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
            }}
        >
            <Button.Group>
                <Button
                    icon={<QuestionCircleOutlined />}
                    disabled={isAuthenticating}
                    onClick={() => navigate(`/login/forgot-password?username=${form.getFieldValue("username") || ""}`)}
                >
                    I forgot my password
                </Button>
                <Button
                    icon={<LoginOutlined />}
                    type="primary"
                    htmlType="submit"
                    loading={isAuthenticating}
                >
                    Login
                </Button>
            </Button.Group>
        </div>
    </Form>
}
