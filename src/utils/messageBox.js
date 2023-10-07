import { ElMessage } from 'element-plus'

export const message = (message, type) => {
    ElMessage({
        message: message,
        type: type,
    })
}