import React from "react"
import { Form, Input, Button } from "antd"
import { LoginOutlined } from "@ant-design/icons"

import { useAuth } from "context/auth"


export const Login = () => {
    const { login, isAuthenticating } = useAuth()

    return <Form
        name="login"
        requiredMark={false}
        onFinish={(values) => login(values)}
        validateMessages={{
            required: "${label} required"
        }}
    >
        <Form.Item
            label="User"
            name="username"
            rules={[
                { required: true }
            ]}
        >
            <Input autoComplete="mail" />
        </Form.Item>
        <Form.Item
            label="Password"
            name="password"
            rules={[
                { required: true }
            ]}
        >
            <Input.Password autoComplete="password" />
        </Form.Item>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
            }}
        >
            <Button
                icon={<LoginOutlined />}
                type="primary"
                htmlType="submit"
                loading={isAuthenticating}
            >
                Login
            </Button>
        </div>
    </Form>
}
