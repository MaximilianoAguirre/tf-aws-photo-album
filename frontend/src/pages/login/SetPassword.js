import React from "react"
import { Form, Input, Button } from "antd"
import { CheckCircleOutlined } from "@ant-design/icons"
import { Navigate } from "react-router-dom"

import { useAuth } from "context/auth"


export const SetPassword = () => {
    const { user, isAuthenticating, setPassword } = useAuth()

    if (!user) return <Navigate to="/login" />

    return <Form
        name="new-password"
        requiredMark={false}
        validateMessages={{
            required: "${label} required"
        }}
        onFinish={(values) => {
            console.log(values)
            setPassword(values)
        }}
    >
        <Form.Item
            label="User"
            name="username"
            initialValue={user.challengeParam.userAttributes.email}
            rules={[
                { required: true }
            ]}

        >
            <Input disabled autoComplete="off" />
        </Form.Item>
        <Form.Item
            label="New password"
            name="newPassword"
            hasFeedback
            rules={[
                { required: true },
                { type: "string" },
                {
                    min: 10,
                    message: "${label} must have at least 10 chars"
                },
                {
                    whitespace: true,
                    message: "${label} can not be empty"
                }
            ]}
        >
            <Input.Password autoComplete="off" />
        </Form.Item>
        <Form.Item
            label="Confirm password"
            name="confirm_password"
            hasFeedback
            dependencies={['newPassword']}
            rules={[
                { required: true },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject("Passwords do not match!");
                    },
                })
            ]}
        >
            <Input.Password autoComplete="off" />
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
                icon={<CheckCircleOutlined />}
                type="primary"
                htmlType="submit"
                loading={isAuthenticating}
            >
                Set new password
            </Button>
        </div>
    </Form>
}

