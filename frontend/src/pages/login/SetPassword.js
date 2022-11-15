import React from "react"
import { Form, Input, Button } from "antd"
import { CheckCircleOutlined } from "@ant-design/icons"
import { Navigate } from "react-router-dom"

import { useAuth, CHALLENGES } from "context/auth"


export const SetPassword = () => {
    const { isChallenged, challenge, challengePayload, isAuthenticating, setPassword } = useAuth()

    if (!isChallenged || challenge !== CHALLENGES.SET_PASSWORD) return <Navigate to="/login" />

    return <Form
        name="new-password"
        requiredMark={false}
        onFinish={(values) => setPassword(values)}
        validateMessages={{
            required: "${label} required"
        }}
    >
        <Form.Item
            label="User"
            name="username"
            initialValue={challengePayload.challengeParam.userAttributes.email}
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
