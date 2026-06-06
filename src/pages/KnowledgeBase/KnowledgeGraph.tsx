import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Input, Tag, Descriptions, Statistic } from 'antd';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { graphNodes, graphEdges, nodeTypeColors, nodeTypeLabels, nodeTypeSymbols, relationLabels } from '../../mocks/knowledgeGraph';

interface KnowledgeGraphProps {
  onNodeClick: (node: typeof graphNodes[0]) => void;
}

const nodeTypes = [
  { value: 'all', label: '全部' },
  { value: 'device', label: '设备' },
  { value: 'component', label: '部件' },
  { value: 'fault_mode', label: '故障模式' },
  { value: 'maintenance_strategy', label: '维修策略' },
  { value: 'spare_part', label: '备件' },
  { value: 'symptom', label: '症状' }
];

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onNodeClick }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedNode, setSelectedNode] = useState<typeof graphNodes[0] | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;

    const initChart = () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      
      const dom = chartRef.current;
      if (!dom || dom.clientWidth === 0 || dom.clientHeight === 0) {
        const timer = setTimeout(initChart, 100);
        return () => clearTimeout(timer);
      }

      chartInstance.current = echarts.init(dom);
      setChartReady(true);

      chartInstance.current.on('click', (params: any) => {
        if (params.dataType === 'node') {
          const node = graphNodes.find(n => n.id === params.data.id);
          if (node) {
            setSelectedNode(node);
            onNodeClick(node);
          }
        }
      });

      updateChart();

      const handleResize = () => {
        if (chartInstance.current && dom.clientWidth > 0 && dom.clientHeight > 0) {
          chartInstance.current.resize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    };

    return initChart();
  }, [onNodeClick]);

  useEffect(() => {
    if (chartReady) {
      updateChart();
    }
  }, [selectedType, searchText, chartReady]);

  const updateChart = () => {
    if (!chartInstance.current) return;

    let filteredNodes = graphNodes;
    
    if (selectedType !== 'all') {
      filteredNodes = graphNodes.filter(node => node.type === selectedType);
      const connectedNodeIds = new Set<string>();
      filteredNodes.forEach(node => {
        graphEdges.forEach(edge => {
          if (edge.source === node.id) {
            connectedNodeIds.add(edge.target);
          }
          if (edge.target === node.id) {
            connectedNodeIds.add(edge.source);
          }
        });
      });
      filteredNodes = graphNodes.filter(node => 
        connectedNodeIds.has(node.id) || node.type === selectedType
      );
    }

    if (searchText) {
      const lowerText = searchText.toLowerCase();
      const matchingNodeIds = new Set<string>();
      filteredNodes.forEach(node => {
        if (node.name.toLowerCase().includes(lowerText)) {
          matchingNodeIds.add(node.id);
        }
      });
      if (matchingNodeIds.size > 0) {
        filteredNodes.forEach(node => {
          if (matchingNodeIds.has(node.id)) {
            graphEdges.forEach(edge => {
              if (edge.source === node.id) {
                matchingNodeIds.add(edge.target);
              }
              if (edge.target === node.id) {
                matchingNodeIds.add(edge.source);
              }
            });
          }
        });
        filteredNodes = graphNodes.filter(node => matchingNodeIds.has(node.id));
      }
    }

    const filteredEdges = graphEdges.filter(edge => 
      filteredNodes.some(node => node.id === edge.source) &&
      filteredNodes.some(node => node.id === edge.target)
    );

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `<div style="padding: 8px; min-width: 160px;">
              <div style="font-weight: 600; margin-bottom: 4px; color: #333;">${params.name}</div>
              <div style="color: #999; font-size: 12px;">类型: ${nodeTypeLabels[params.data.type]}</div>
              ${params.data.properties ? `<div style="color: #999; font-size: 12px; margin-top: 4px;">属性: ${JSON.stringify(params.data.properties)}</div>` : ''}
            </div>`;
          } else if (params.dataType === 'edge') {
            return `<div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px; color: #333;">${relationLabels[params.data.relation]}</div>
            </div>`;
          }
          return '';
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          data: filteredNodes.map(node => ({
            id: node.id,
            name: node.name,
            symbol: nodeTypeSymbols[node.type],
            symbolSize: node.type === 'device' ? 45 : node.type === 'component' ? 35 : node.type === 'fault_mode' ? 40 : node.type === 'maintenance_strategy' ? 45 : node.type === 'spare_part' ? 35 : 35,
            itemStyle: {
              color: nodeTypeColors[node.type],
              borderColor: '#fff',
              borderWidth: 2,
              shadowColor: 'rgba(0, 0, 0, 0.15)',
              shadowBlur: 8,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            label: {
              show: true,
              position: 'bottom',
              fontSize: 13,
              color: '#333',
              fontWeight: 500
            },
            type: node.type,
            properties: node.properties
          })),
          links: filteredEdges.map(edge => ({
            source: edge.source,
            target: edge.target,
            lineStyle: {
              width: 2,
              curveness: 0.25,
              color: nodeTypeColors[graphNodes.find(n => n.id === edge.source)?.type || 'device'] || '#ccc',
              opacity: 0.7
            },
            label: {
              show: true,
              fontSize: 11,
              color: '#999',
              formatter: relationLabels[edge.relation]
            },
            relation: edge.relation
          })),
          force: {
            repulsion: 350,
            gravity: 0.15,
            edgeLength: [80, 160],
            friction: 0.6
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4,
              color: '#1890ff'
            },
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(24, 144, 255, 0.4)'
            }
          }
        }
      ]
    };

    chartInstance.current.setOption(option, true);
  };

  const getRelatedNodes = (node: typeof graphNodes[0]) => {
    const related: { node: typeof graphNodes[0]; relation: string; direction: 'source' | 'target' }[] = [];
    graphEdges.forEach(edge => {
      if (edge.source === node.id) {
        const targetNode = graphNodes.find(n => n.id === edge.target);
        if (targetNode) {
          related.push({ node: targetNode, relation: edge.relation, direction: 'source' });
        }
      }
      if (edge.target === node.id) {
        const sourceNode = graphNodes.find(n => n.id === edge.source);
        if (sourceNode) {
          related.push({ node: sourceNode, relation: edge.relation, direction: 'target' });
        }
      }
    });
    return related;
  };

  const stats = {
    total: graphNodes.length,
    devices: graphNodes.filter(n => n.type === 'device').length,
    faults: graphNodes.filter(n => n.type === 'fault_mode').length,
    strategies: graphNodes.filter(n => n.type === 'maintenance_strategy').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Card style={{ flex: 1, minWidth: 160 }} size="small">
          <Statistic 
            title="知识条目" 
            value={stats.total} 
            styles={{ content: { color: '#00a8ff', fontSize: 24, fontWeight: 700 }, title: { fontSize: 12 } }}
          />
        </Card>
        <Card style={{ flex: 1, minWidth: 160 }} size="small">
          <Statistic 
            title="设备" 
            value={stats.devices} 
            styles={{ content: { color: '#00a8ff', fontSize: 24, fontWeight: 700 }, title: { fontSize: 12 } }}
          />
        </Card>
        <Card style={{ flex: 1, minWidth: 160 }} size="small">
          <Statistic 
            title="故障模式" 
            value={stats.faults} 
            styles={{ content: { color: '#e53935', fontSize: 24, fontWeight: 700 }, title: { fontSize: 12 } }}
          />
        </Card>
        <Card style={{ flex: 1, minWidth: 160 }} size="small">
          <Statistic 
            title="维修策略" 
            value={stats.strategies} 
            styles={{ content: { color: '#26a69a', fontSize: 24, fontWeight: 700 }, title: { fontSize: 12 } }}
          />
        </Card>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 16, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 16, padding: '10px 20px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                placeholder="搜索设备、故障模式、维修方案..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                size="small"
              />
              <Select
                placeholder="设备类型"
                style={{ width: 140 }}
                value={selectedType}
                onChange={setSelectedType}
                size="small"
              >
                {nodeTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>{type.label}</Select.Option>
                ))}
              </Select>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginLeft: 'auto' }}>
                {Object.entries(nodeTypeColors).map(([type, color]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span 
                      style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: type === 'fault_mode' ? 2 : type === 'maintenance_strategy' ? 4 : '50%',
                        backgroundColor: color,
                        boxShadow: `0 2px 4px rgba(0,0,0,0.15)`
                      }} 
                    />
                    <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{nodeTypeLabels[type]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div 
              ref={chartRef} 
              style={{ 
                flex: 1, 
                width: '100%',
                minHeight: '400px'
              }} 
            />
          </Card>
        </div>

        {selectedNode && (
          <div style={{ width: 320, flexShrink: 0 }}>
            <Card 
              title={selectedNode.name} 
              size="small"
              extra={<Tag color={nodeTypeColors[selectedNode.type]}>{nodeTypeLabels[selectedNode.type]}</Tag>}
            >
              {selectedNode.properties && (
                <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#333' }}>关联节点</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {getRelatedNodes(selectedNode).slice(0, 6).map((item, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: '6px 8px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 4
                      }}
                    >
                      <span 
                        style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: item.node.type === 'fault_mode' ? 1 : '50%',
                          backgroundColor: nodeTypeColors[item.node.type] 
                        }} 
                      />
                      <span style={{ fontSize: 12, color: '#666', flex: 1 }}>{item.node.name}</span>
                      <span style={{ fontSize: 11, color: '#999' }}>{relationLabels[item.relation]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNode.type === 'fault_mode' && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#333' }}>推荐维修方案</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {getRelatedNodes(selectedNode)
                      .filter(item => item.node.type === 'maintenance_strategy')
                      .map((item, index) => (
                        <button
                          key={index}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fff',
                            border: '1px solid #e8e8e8',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            color: '#333'
                          }}
                        >
                          <span>{item.node.name}</span>
                          <ArrowRightOutlined style={{ fontSize: 12, color: '#1890ff' }} />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;