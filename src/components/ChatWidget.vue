<!--
placeholder for Opey II Chat widget
--> 
<script>

import { ref } from 'vue'
import { useChat } from '@ai-sdk/vue'

export default {
    setup () {
        const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
            api:'/api/opey/stream'
        })

        return {
            messages,
            input,
            handleInputChange,
            handleSubmit,
            addToolResult
        }
    },
    data() {
        return {
            chatOpen: false
        }
    },
    methods: {
        toggleChat() {
            this.chatOpen = !this.chatOpen
        }
    },
}

</script>

<template>
    <el-tooltip content="Chat with our AI, Opey" placement="left" effect="light">
        <div class="chat-widget-button-container">
            <el-button class="chat-widget-button" type="primary" size="large" @click="this.toggleChat" circle >
                <img alt="AI Help" src="@/assets/chatbot.png" />
            </el-button>
        </div>
    </el-tooltip>

    <div v-if="this.chatOpen" class="chat-container">
        <div class="chat-container-inner">
            <el-container>
                <el-header>Header</el-header>
                <el-main>Main</el-main>
                <el-footer>Footer</el-footer>
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
}

.chat-container-inner {
    transform: rotate(180deg);
}

</style>