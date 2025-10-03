#!/usr/bin/python
# -*- coding: UTF-8 -*-
 
import smtplib
from email.mime.text import MIMEText
from email.header import Header
import sys

# 第三方 SMTP 服务
mail_host="smtp.163.com"  #设置服务器
mail_user="joy_gong33@163.com"    #用户名
mail_pass="TUdTh34X2tYFRNib"   #口令 
 

receivers = ['gwifloria@outlook.com'] 
 

def main():
    args = sys.argv[1:]
    row = args[0]
    seat = args[1]
    message_body = f"""
    第 {row} 排 {seat} 号位已经空出。

    赶紧去抢
    
    """
    message = MIMEText(message_body, 'plain', 'utf-8')

    message['From'] = "joy_gong33@163.com"
    message['To'] = "gwifloria@outlook.com"
    subject = '第'+row+'排'+seat+'号位空出啦！'
    message['Subject'] = Header(subject, 'utf-8')
 
    try:
        smtpObj = smtplib.SMTP() 
        smtpObj.connect(mail_host, 25)    # 25 为 SMTP 端口号
        smtpObj.login(mail_user,mail_pass)  
        smtpObj.sendmail(mail_user, receivers, message.as_string())
        print ("邮件发送成功")
    except smtplib.SMTPException as e :
        print ("Error: 无法发送邮件",{e})

    
main()