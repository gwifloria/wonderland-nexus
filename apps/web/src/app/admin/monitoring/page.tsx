"use client";

import { logger } from "@/monitoring/logger";
import { Column, Line } from "@ant-design/plots";
import {
  Alert,
  Card,
  Col,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tabs,
  Typography,
} from "antd";
import { useCallback, useEffect, useState } from "react";

const { Title } = Typography;
const { Option } = Select;

interface WebVitalData {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: string;
  url: string;
  deviceType: string;
}

interface MonitoringData {
  webVitals?: WebVitalData[];
  summary?: Array<{
    _id: string;
    avgValue: number;
    goodPercentage: number;
    needsImprovementPercentage: number;
    poorPercentage: number;
  }>;
  deviceBreakdown?: Array<{
    _id: string;
    count: number;
    avgLCP?: number;
  }>;
}

interface PerformanceMetricsData {
  stats?: Array<{
    _id: string;
    count: number;
    avgValue: number;
    minValue: number;
    maxValue: number;
    poorCount: number;
  }>;
}

interface LogsData {
  logs?: Array<{
    _id: string;
    level: string;
    message: string;
    timestamp: string;
    url: string;
  }>;
}

export default function MonitoringDashboard() {
  const [timeframe, setTimeframe] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [webVitals, setWebVitals] = useState<MonitoringData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetricsData | null>(null);
  const [logs, setLogs] = useState<LogsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchMonitoringData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [webVitalsRes, performanceRes, logsRes] = await Promise.all([
        fetch(`/api/monitoring/web-vitals?timeframe=${timeframe}`),
        fetch(`/api/monitoring/performance?timeframe=${timeframe}`),
        fetch(`/api/monitoring/logs?level=error&limit=50`),
      ]);

      if (!webVitalsRes.ok || !performanceRes.ok || !logsRes.ok) {
        throw new Error("Failed to fetch monitoring data");
      }

      const [webVitalsData, performanceData, logsData] = await Promise.all([
        webVitalsRes.json(),
        performanceRes.json(),
        logsRes.json(),
      ]);

      setWebVitals(webVitalsData);
      setPerformanceMetrics(performanceData);
      setLogs(logsData);

      logger.info("Monitoring dashboard data loaded", {
        webVitalsCount: webVitalsData.webVitals?.length || 0,
        performanceCount: performanceData.metrics?.length || 0,
        logsCount: logsData.logs?.length || 0,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      logger.error("Failed to fetch monitoring data", err as Error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchMonitoringData();
  }, [timeframe, fetchMonitoringData]);

  const renderWebVitalsOverview = () => {
    if (!webVitals?.summary) return null;

    return (
      <Row gutter={[16, 16]}>
        {webVitals.summary.map((vital) => (
          <Col span={8} key={vital._id}>
            <Card>
              <Statistic
                title={vital._id}
                value={vital.avgValue}
                precision={vital._id === "CLS" ? 3 : 0}
                suffix={vital._id === "CLS" ? "" : "ms"}
                valueStyle={{
                  color:
                    vital.goodPercentage > 75
                      ? "#3f8600"
                      : vital.poorPercentage > 25
                        ? "#cf1322"
                        : "#faad14",
                }}
              />
              <div className="mt-2 text-sm text-gray-600">
                <div>Good: {vital.goodPercentage.toFixed(1)}%</div>
                <div>
                  Needs Improvement:{" "}
                  {vital.needsImprovementPercentage.toFixed(1)}%
                </div>
                <div>Poor: {vital.poorPercentage.toFixed(1)}%</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderWebVitalsChart = () => {
    if (!webVitals?.webVitals) return null;

    const chartData = webVitals.webVitals.map((vital: WebVitalData) => ({
      timestamp: new Date(vital.timestamp).toLocaleString(),
      value: vital.value,
      name: vital.name,
      rating: vital.rating,
    }));

    const config = {
      data: chartData,
      xField: "timestamp",
      yField: "value",
      seriesField: "name",
      smooth: true,
      animation: {
        appear: {
          animation: "path-in",
          duration: 1000,
        },
      },
    };

    return <Line {...config} />;
  };

  const renderPerformanceChart = () => {
    if (!performanceMetrics?.stats) return null;

    const chartData = performanceMetrics.stats.map((stat) => ({
      name: stat._id,
      avgValue: stat.avgValue,
      count: stat.count,
      poorCount: stat.poorCount,
    }));

    const config = {
      data: chartData,
      xField: "name",
      yField: "avgValue",
      colorField: "name",
      label: {
        position: "top" as const,
        style: {
          fill: "#000000",
          opacity: 0.8,
        },
      },
    };

    return <Column {...config} />;
  };

  const renderErrorLogs = () => {
    if (!logs?.logs) return null;

    const columns = [
      {
        title: "Timestamp",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp: string) => new Date(timestamp).toLocaleString(),
        width: 150,
      },
      {
        title: "Level",
        dataIndex: "level",
        key: "level",
        render: (level: string) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              level === "error"
                ? "bg-red-100 text-red-800"
                : level === "warn"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {level.toUpperCase()}
          </span>
        ),
        width: 80,
      },
      {
        title: "Message",
        dataIndex: "message",
        key: "message",
        ellipsis: true,
      },
      {
        title: "URL",
        dataIndex: "url",
        key: "url",
        ellipsis: true,
        width: 200,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={logs.logs}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    );
  };

  const renderDeviceBreakdown = () => {
    if (!webVitals?.deviceBreakdown) return null;

    const chartData = webVitals.deviceBreakdown.map((device) => ({
      device: device._id,
      count: device.count,
      avgLCP: device.avgLCP,
    }));

    const config = {
      data: chartData,
      angleField: "count",
      colorField: "device",
      radius: 0.8,
      label: {
        type: "outer",
        content: "{name} {percentage}",
      },
      interactions: [{ type: "element-active" }],
    };

    return (
      <div>
        <Title level={4}>Device Type Distribution</Title>
        {/* You would use a Pie chart here, but I'll keep it simple */}
        <div className="grid grid-cols-3 gap-4">
          {chartData.map((item) => (
            <Card key={item.device} size="small">
              <Statistic
                title={item.device}
                value={item.count}
                suffix="sessions"
              />
              {item.avgLCP && (
                <div className="text-sm text-gray-600">
                  Avg LCP: {item.avgLCP.toFixed(0)}ms
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error Loading Monitoring Data"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={fetchMonitoringData}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Performance Monitoring Dashboard</Title>
          <Select
            value={timeframe}
            onChange={setTimeframe}
            style={{ width: 120 }}
          >
            <Option value="1h">Last Hour</Option>
            <Option value="24h">Last 24h</Option>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
          </Select>
        </div>

        <Tabs
          defaultActiveKey="1"
          size="large"
          items={[
            {
              key: "1",
              label: "Web Vitals",
              children: (
                <div className="space-y-6">
                  <Card title="Core Web Vitals Overview">
                    {renderWebVitalsOverview()}
                  </Card>

                  <Card title="Web Vitals Trends">
                    {renderWebVitalsChart()}
                  </Card>

                  {renderDeviceBreakdown()}
                </div>
              ),
            },
            {
              key: "2",
              label: "Performance Metrics",
              children: (
                <>
                  <Card title="Performance Metrics Summary">
                    {renderPerformanceChart()}
                  </Card>

                  {performanceMetrics?.stats && (
                    <Card title="Detailed Performance Stats" className="mt-6">
                      <Table
                        columns={[
                          { title: "Metric", dataIndex: "_id", key: "metric" },
                          { title: "Count", dataIndex: "count", key: "count" },
                          {
                            title: "Avg Value",
                            dataIndex: "avgValue",
                            key: "avg",
                            render: (val: number) => `${val.toFixed(2)}ms`,
                          },
                          {
                            title: "Min Value",
                            dataIndex: "minValue",
                            key: "min",
                            render: (val: number) => `${val.toFixed(2)}ms`,
                          },
                          {
                            title: "Max Value",
                            dataIndex: "maxValue",
                            key: "max",
                            render: (val: number) => `${val.toFixed(2)}ms`,
                          },
                          {
                            title: "Poor Count",
                            dataIndex: "poorCount",
                            key: "poor",
                          },
                        ]}
                        dataSource={performanceMetrics.stats}
                        rowKey="_id"
                        pagination={false}
                      />
                    </Card>
                  )}
                </>
              ),
            },
            {
              key: "3",
              label: "Error Logs",
              children: (
                <Card title="Recent Error Logs">{renderErrorLogs()}</Card>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
