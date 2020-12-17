class Socket {
    constructor (domain) {
        this.domain = domain
        this.SocketTask = null
        this.eventQueue = []
        this.allEvent = {}
        this.alreadyConnect = false
        this.reConnectTime = null // 断线重连计时器
    }

    // 初始化socket
    initSocket () {
        this.SocketTask = this.creatSocketLink()  // 创建连接实例
        this.listenConnectError() // 连接异常
        this.connectSuc() // 监听连接成功
        this.listenSocketClose() // 监听连接断开
        this.listenMessageBack() // 监听事件回调执行
    } 

    // 创建socket连接
    creatSocketLink () {
        return new WebSocket(this.domain)
    }
    // 连接异常
    listenConnectError () {
        this.SocketTask.onerror = res => {
            console.log('连接异常')
        }
    }

    // 监听连接成功
    connectSuc () {
        this.SocketTask.onopen = res => {
            this.alreadyConnect = true
            console.log('连接成功')
            this.clearAllTime()
        }
    }

    // 监听连接断开
    listenSocketClose () {
        this.SocketTask.onclose = res => {
            console.log('连接断开')
            this.clearAllTime()
            if (this.alreadyConnect) {
                this.reConnectTime = setTimeout(() => {
                    this.initSocket()
                }, 5000)
            }
        }
    }

    // 监听事件回调执行 
    listenMessageBack () {
        this.SocketTask.onmessage = ({ data }) => {
            data = JSON.parge(data)
            this.allEvent.cb && this.allEvent.cb()
            if (this.eventQueue.length !== 0 ) {
                this.eventQueue.forEach(item => {
                    if (item.event === data.event) {
                        item.cb(data.msg)
                    }
                })
            }
        }
    }

    // 订阅具体事件 
    addListener (event, cb) {
        this.eventQueue.push({
            event,
            cb
        })
    }

    // 发送socket消息
    sendSocketMessage (obj) {
        try {
            this.SocketTask.send(JSON.stringify(obj))
        } catch (e) {

        }
    }
 
    // 移除订阅的具体事件 
    removeListener (event) {
        this.eventQueue.filter(item => item.event !== event)
    }

    // 订阅所有事件
    addAllListener (cb) {
        this.allEvent = { cb }
    } 

    // 移除订阅的所有事件
    removeAllListener () {
        this.allEvent = {}
    } 

    // 手动关闭连接
    closeSocket () {
        if (this.alreadyConnect) {
            this.SocketTask.close()
            console.log('手动关闭连接')
        }
    }


    // 清除所有事件
    clearAllTime () {
        if (this.reConnectTime) {
            clearInterval(this.reConnectTime)
            this.reConnectTimer = null
        }
    }
}

module.exports = Socket