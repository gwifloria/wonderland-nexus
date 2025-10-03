## 我看了一下官方 hook 的建议使用方式，我的理解是：

- [ ] 我们的 settings.json 里配置了生命周期的调用函数，
      {
      "hooks": {
      "Stop": [
      {
      "hooks": [
      {
      "type": "command",
      "command": "update-status.sh stop"
      }
      ]
      }
      ],
      "SubagentStop": [
      {
      "hooks": [
      {
      "type": "command",
      "command": "update-status.sh SubagentStop"
      }
      ]
      }
      ],
      "SessionStart": [
      {
      "hooks": [
      {
      "type": "command",
      "command": "osascript -e 'display dialog \"SessionStart\"'"
      }
      ]
      }
      ],
      "UserPromptSubmit": [
      {
      "matcher": "",
      "hooks": [
      {
      "type": "command",
      "command": "osascript -e 'display dialog \"UserPromptSubmit\"'"
      }
      ]
      }
      ]
      }
      }
