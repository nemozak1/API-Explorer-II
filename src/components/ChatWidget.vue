<!--
placeholder for Opey II Chat widget
--> 
<script>

import { ref, reactive } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { Close } from '@element-plus/icons-vue'

export default {
    setup () {
        const { messages, input, handleInputChange, handleSubmit, addToolResult, status } = useChat({
            api:'/api/opey/stream'
        })

        return {
            messages,
            input,
            handleInputChange,
            handleSubmit,
            addToolResult,
            status,
            Close
        }
    },
    data() {
        return {
            chatOpen: false,
            userInput: reactive({
                user: '',
                input_content: '',
                thread_id: '',
            }),
        }
    },
    methods: {
        toggleChat() {
            this.chatOpen = !this.chatOpen
        },
        async onSubmit() {
            this.handleSubmit(chatRequestOptions={

            })
        }
    },
}

</script>

<template>
    <div v-if="!this.chatOpen" class="chat-widget-button-container">
        <el-tooltip content="Chat with our AI, Opey" placement="left" effect="light">
            <el-button class="chat-widget-button" type="primary" size="large" @click="this.toggleChat" circle >
                <img alt="AI Help" src="@/assets/opey-icon-white.png" />
            </el-button>
        </el-tooltip>
    </div>

    <div v-if="this.chatOpen" class="chat-container">
        <div class="chat-container-inner">
            <el-container direction="vertical">
                <el-header>
                    <img alt="Opey Logo" src="@/assets/opey-logo-inv.png"> 
                    Chat with Opey
                    <el-button type="danger" :icon="this.Close" @click="this.toggleChat" size="small" circle></el-button>
                </el-header>
                <el-main>
                    <div v-for="message in messages" :key="message.id">
                        <div>{{ message.role }}</div>
                        <div>{{ message.content }}</div>
                    </div>
                </el-main>
                <el-footer>
                    <el-form :inline="true" :model="userInput">
                        <el-form-item label="Message">
                            <el-input v-model="input" placeholder="Type your message..." :disabled="status !== 'ready'" clearable />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="this.onSubmit">Send</el-button>
                        </el-form-item>
                    </el-form>
                </el-footer>
            </el-container>
        </div>
    </div>
</template>

<style>


.chat-widget-button-container {
    position: fixed;
    bottom: 20px;
    right: 50px;
    width: 60px;
    height: 60px;
}

.chat-widget-button {
    width: 70px !important;
    height: 70px !important;
}

.chat-widget-button img {
    width: 100%;
    height: 100%;
}

.chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 390px;
    height: 470px;
    min-width: 390px;
    min-height: 470px;
    max-height: 80vh;
    max-width: 80vw;
    background-color: tomato;
    resize: both;
    overflow: auto;
    transform: rotate(180deg);
    border-radius: 10px;
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.2);
}

.chat-container .el-header, .chat-container .el-footer, .chat-container .el-main {
    display: flex;
    justify-content: center;
    align-items: center;
}

.chat-container .el-container {
    height: 100%;
}

.chat-container .el-header {
    justify-content: space-between;
}

.chat-container .el-header img {
    height: 50px;
}

.chat-container .el-header, .chat-container .el-footer {
    color: #fff;
    background-color: #253047;
}

.chat-container .el-main {
    background-color:#151d30;
    color: #fff;
}

.chat-container-inner {
    height: 100%;
    transform: rotate(180deg);
}

</style>