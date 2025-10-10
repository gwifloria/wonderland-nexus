import { ProjectExperience, WorkHistory } from "../types/contact";
import auto1 from "/public/images/auto1.png";
import auto2 from "/public/images/auto2.png";
import auto3 from "/public/images/auto3.png";

import cloud1 from "/public/images/cloud1.png";
import cloud2 from "/public/images/cloud2.png";
import cloud3 from "/public/images/cloud3.png";

export const workHistoryList: WorkHistory[] = [
  {
    companyName:
      "SenseTime Technology - Front-End Engineering Cloud Computing Platform Group",
    responsibilities: [
      "- Using React, Typescript, Vue, Taro to complete the front-end development of cloud control platform products",
      "- Collaborate with product design team and backend team to realize function iteration and maintenance of Cloud Computing Platform group management system and mobile end H5",
      "- Participate in project review, formulation and implementation of technical design schemes; participate in the writing, encapsulation and code optimization of common components",
    ],

    startTime: "",
  },
  {
    companyName: "Tonche Information And Technology Co., Ltd",
    responsibilities: [
      "- Use Vue to complete the front-end development, product iteration and maintenance of the companys B-side e-map and erp management background",
      "- Complete the front-end function module of WeChat Mini Program (native wxml), cooperate with the back-end to realize user order, template push notification and other functions",
      "- Implemented business requirements once using php + mysql",
    ],
    startTime: "",
  },
];

export const projectExperienceList: ProjectExperience[] = [
  {
    projectName: "Autonomous Driving Operation Platform",
    projectBackground:
      "The autonomous driving operation platform is a 2D map project that presents current autonomous driving operation overview data and real-time location of autonomous vehicles",
    details: [
      "- Under the guidance of the leader, responsible for project development, scheduling, coordination and development work (3 people)",
      "- Complete (Vue+Typescript+Pinia+Element Plus) project construction",
      "- Based on Baidu Maps (bmapgl), complete the map page function development and module animation:",
    ],
    skills: ["React", "Antd", "Webgl", "Typescript", "Echarts"],
    pictures: [auto1, auto2, auto3],
  },
  {
    projectName: "Cloud Control Platform System Project",
    projectBackground:
      'The cloud control platform is a "vehicle-road cloud integration" platform for collaborative supervision, analysis and decision-making to meet the needs of intelligent driving vehicle supervision and scheduling, smart travel, etc. It supports the monitoring and management of vehicles and roadside equipment',
    details: [
      "- Use React.js+Typescript+Antd to complete the background management project CRUD basic functions, use css drawing interface to achieve product requirements",
      "- Use Echarts to implement data display pie charts, column charts, dashboards, etc",
      "- Use Fabric.js to realize canvas to draw the sweeper track line on the picture, and complete the upload and echo functions",
      "- Operation and Maintenance Management Subsystem (vue): Collaborate to complete the Node.js large file slicing upload function (responsible for the non-Node.js part)",
    ],
    skills: ["Vue", "Fabric.js", "Pinia"],
    pictures: [cloud1, cloud2, cloud3],
  },
];
