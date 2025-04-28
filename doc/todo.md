使用javascript编写。

web的一个页面。要做的是填写的prompt,

然后依次调用4个API，每个API标注名称，和API最终结果文生图的效果。

API调用采用读取.env中的秘钥

这些API分别是：通义万相 ，混元，Luma AI,Mass API
先完成第一个通义万相的调用

通义万相API调用方法，从.env中读取秘钥WANX_KEY

curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis \
    -H 'X-DashScope-Async: enable' \
    -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{
    "model": "wanx2.1-t2i-turbo",
    "input": {
        "prompt": "一间有着精致窗户的花店，漂亮的木质门，摆放着花朵"
    }
}'

返回的内容是：

output object

任务输出信息。

属性

task_id string

任务ID。

task_status string

任务状态。

枚举值

PENDING：任务排队中

RUNNING：任务处理中

SUSPENDED：任务挂起

SUCCEEDED：任务执行成功

FAILED：任务执行失败

UNKNOWN：任务不存在或状态未知

request_id string

请求唯一标识。可用于请求明细溯源和问题排查。

code string

请求失败的错误码。请求成功时不会返回此参数，详情请参见错误信息。

message string

请求失败的详细信息。请求成功时不会返回此参数，详情请参见错误信息。



根据任务ID查询结果：

GET https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}

示例：

curl -X GET \
--header "Authorization: Bearer $DASHSCOPE_API_KEY" \
https://dashscope.aliyuncs.com/api/v1/tasks/86ecf553-d340-4e21-xxxxxxxxx

结果:

{
    "request_id": "f767d108-7d50-908b-a6d9-xxxxxx",
    "output": {
        "task_id": "d492bffd-10b5-4169-b639-xxxxxx",
        "task_status": "SUCCEEDED",
        "submit_time": "2025-01-08 16:03:59.840",
        "scheduled_time": "2025-01-08 16:03:59.863",
        "end_time": "2025-01-08 16:04:10.660",
        "results": [
            {
                "orig_prompt": "一间有着精致窗户的花店，漂亮的木质门，摆放着花朵",
                "actual_prompt": "一间有着精致雕花窗户的花店，漂亮的深色木质门上挂着铜制把手。店内摆放着各式各样的鲜花，包括玫瑰、百合和向日葵，色彩鲜艳，生机勃勃。背景是温馨的室内场景，透过窗户可以看到街道。高清写实摄影，中景构图。",
                "url": "https://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1.png"
            }
        ],
        "task_metrics": {
            "TOTAL": 1,
            "SUCCEEDED": 1,
            "FAILED": 0
        }
    },
    "usage": {
        "image_count": 1
    }
}

