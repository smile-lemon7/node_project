const SMSClient = require('@alicloud/sms-sdk')  //引入模块

const accessKeyId = 'LTAIZQoVVoPuBjU9'  //账户和密码的标识
const secretAccessKey = 'GfJuI2dLsCQh7Q56TmFxPTniXjkVnB'
let smsClient = new SMSClient({accessKeyId, secretAccessKey})

exports.sendCode = function ( options ) {
      smsClient.sendSMS({
        PhoneNumbers: options.phoneNum,
        SignName: '吴勋勋',//按照严格意义来说，此处的签名和模板的ID都是可变的
        TemplateCode: 'SMS_111785721',
        TemplateParam: '{code:'+ options.code +'}'
    }).then(function (res) {
        let {Code}=res
        if (Code === 'OK') {
            //处理返回参数
            // console.log("111111111111111111111")
            options.success('ok') //返回一个函数
        }
    }, function (err) {
        console.log(err)
    })
}

