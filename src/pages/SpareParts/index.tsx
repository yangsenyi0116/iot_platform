import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Row, Col, Button, Tag, Select, Input, Modal, Table, Space, Descriptions } from 'antd';
import { DownloadOutlined, ShoppingCartOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { mockSpareParts, mockProcurementSuggestions, warehouseStats, stockStatusLabels, stockStatusColors, type StockStatus, type SparePartItem } from '../../mocks/spareParts';

export default function SpareParts() {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePartItem | null>(null);
  const [stockData, setStockData] = useState(mockSpareParts);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const pieChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (pieChartRef.current) {
      pieChartInstance.current = echarts.init(pieChartRef.current);
      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}% ({d}%)',
        },
        legend: {
          bottom: 0,
          textStyle: { color: '#666', fontSize: 12 },
        },
        series: [
          {
            name: '仓库分布',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}\n{c}%',
              fontSize: 12,
            },
            data: warehouseStats.map(item => ({
              name: item.name,
              value: item.value,
              itemStyle: { color: item.color },
            })),
          },
        ],
      };
      pieChartInstance.current.setOption(option);

      const handleResize = () => pieChartInstance.current?.resize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const filteredData = useMemo(() => {
    return stockData.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [stockData, searchText, selectedStatus, selectedCategory]);

  const stats = useMemo(() => {
    const total = stockData.reduce((sum, p) => sum + p.stock, 0);
    const criticalCount = stockData.filter(p => p.status === 'critical').length;
    const outCount = stockData.filter(p => p.status === 'out').length;
    const overstockCount = stockData.filter(p => p.status === 'overstock').length;
    return { total, criticalCount, outCount, overstockCount };
  }, [stockData]);

  const categories = useMemo(() => {
    const cats = new Set(stockData.map(p => p.category));
    return Array.from(cats);
  }, [stockData]);

  const handlePurchase = (partId: string) => {
    setStockData(prev => prev.map(p => {
      if (p.id === partId) {
        const suggestion = mockProcurementSuggestions.find(s => s.partId === partId);
        return { ...p, stock: p.stock + (suggestion?.suggestedQuantity || 10) };
      }
      return p;
    }));
    setShowDetailModal(false);
  };

  const handleViewDetail = (part: SparePartItem) => {
    setSelectedPart(part);
    setShowDetailModal(true);
  };

  const tableColumns = [
    { title: '备件名称', dataIndex: 'name', key: 'name', width: 140, render: (name: string, record: SparePartItem) => (
      <span style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => handleViewDetail(record)}>{name}</span>
    )},
    { title: '备件编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '库存量', dataIndex: 'stock', key: 'stock', width: 80, render: (stock: number, record: SparePartItem) => (
      <span style={{ fontWeight: 600, color: stockStatusColors[record.status] }}>{stock}</span>
    )},
    { title: '安全库存', dataIndex: 'safetyStock', key: 'safetyStock', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (status: StockStatus) => (
      <Tag color={stockStatusColors[status]}>{stockStatusLabels[status]}</Tag>
    )},
    { title: '存储仓库', dataIndex: 'warehouse', key: 'warehouse', width: 80 },
    { title: '最近领用', dataIndex: 'lastIssuedDate', key: 'lastIssuedDate', width: 120 },
    { title: '操作', key: 'action', width: 120, render: (_: unknown, record: SparePartItem) => (
      <Space>
        <Button size="small" onClick={() => handleViewDetail(record)}>详情</Button>
        <Button size="small" type="primary" onClick={() => handlePurchase(record.id)}>采购</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>备件管理</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input.Search
            placeholder="搜索备件名称/编码"
            style={{ width: 250 }}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            value={selectedStatus}
            onChange={value => setSelectedStatus(value as StockStatus | 'all')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'out', label: '缺货' },
              { value: 'critical', label: '低库存' },
              { value: 'warning', label: '预警' },
              { value: 'normal', label: '正常' },
              { value: 'overstock', label: '积压' },
            ]}
          />
          <Select
            placeholder="分类筛选"
            style={{ width: 120 }}
            value={selectedCategory}
            onChange={value => setSelectedCategory(value)}
            options={[{ value: 'all', label: '全部' }, ...categories.map(c => ({ value: c, label: c }))]}
          />
          <Button icon={<DownloadOutlined />}>导出</Button>
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #1890ff' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>总备件数</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>{stats.total.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>↑ 较上周 +12</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #faad14' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>低库存预警</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>{stats.criticalCount}</div>
            <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>↓ 较上周 -5</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #ff4d4f' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>缺货数量</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff4d4f' }}>{stats.outCount}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>→ 较上周 0</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderLeft: '4px solid #f97316' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>积压数量</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f97316' }}>{stats.overstockCount}</div>
            <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>↑ 较上周 +2</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card size="small" title="库存分布">
            <div ref={pieChartRef} style={{ height: 250 }} />
            <div style={{ textAlign: 'center', marginTop: 8, color: '#999', fontSize: 12 }}>仓库分布（可按类型切换）</div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="采购建议列表">
            <div style={{ marginBottom: 8, fontSize: 12, color: '#999' }}>
              💡 共 {mockProcurementSuggestions.length} 条采购建议，其中 {mockProcurementSuggestions.filter(s => s.hasAIOptimization).length} 条包含 AI 优化建议
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflow: 'auto' }}>
              {mockProcurementSuggestions.slice(0, 5).map(item => (
                <div key={item.id} style={{ padding: 12, background: '#fafafa', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag color={stockStatusColors[item.status]} style={{ fontSize: 11 }}>{stockStatusLabels[item.status]}</Tag>
                      <span style={{ fontWeight: 500 }}>{item.partName}</span>
                      <span style={{ color: '#999', fontSize: 12 }}>({item.partCode})</span>
                      {item.hasAIOptimization && <span style={{ fontSize: 12 }}>🤖</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      库存: {item.currentStock} | 安全库存: {item.safetyStock} | 建议采购: {item.suggestedQuantity}
                    </div>
                    {item.aiReason && (
                      <div style={{ fontSize: 11, color: '#1890ff', marginTop: 2 }}>{item.aiReason}</div>
                    )}
                  </div>
                  <Button size="small" type="primary" icon={<ShoppingCartOutlined />} onClick={() => handlePurchase(item.partId)}>一键采购</Button>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card size="small" title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          备件库存列表
          <Button size="small" icon={<DownloadOutlined />}>导出</Button>
        </div>
      } style={{ marginTop: 24 }}>
        <Table
          dataSource={filteredData}
          columns={tableColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedPart ? `${selectedPart.name} - 详情` : '备件详情'}
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        width={800}
        footer={null}
      >
        {selectedPart && (
          <div>
            <Card size="small" title="🤖 AI 分析摘要" style={{ marginBottom: 16, background: '#f0f5ff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>库存状态：</span>
                  <Tag color={stockStatusColors[selectedPart.status]}>{stockStatusLabels[selectedPart.status]}</Tag>
                </div>
                <div>
                  <span>健康评估：</span>
                  <span style={{ color: '#666' }}>
                    {selectedPart.status === 'overstock' 
                      ? `库存积压严重，建议暂停采购，预计可释放资金 ¥${selectedPart.totalValue.toLocaleString()}`
                      : selectedPart.status === 'out'
                        ? '已缺货，可能影响生产，建议紧急采购'
                        : selectedPart.status === 'critical'
                          ? '库存偏低，建议尽快采购'
                          : selectedPart.status === 'warning'
                            ? '库存接近安全线，建议关注'
                            : '库存状态良好'}
                  </span>
                </div>
                <div>
                  <span>领用趋势：</span>
                  <span style={{ color: '#666' }}>
                    近3个月领用量{selectedPart.issueRecords.length > 1 && selectedPart.issueRecords[0].quantity > selectedPart.issueRecords[1].quantity ? '上升' : '下降'} {Math.abs(selectedPart.issueRecords[0]?.quantity - selectedPart.issueRecords[1]?.quantity) || 0}%
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button size="small" type="primary" onClick={() => handlePurchase(selectedPart.id)}>采纳建议</Button>
                <Button size="small" onClick={() => setShowDetailModal(false)}>忽略</Button>
              </div>
            </Card>

            <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="备件名称">{selectedPart.name}</Descriptions.Item>
                    <Descriptions.Item label="备件编码">{selectedPart.code}</Descriptions.Item>
                    <Descriptions.Item label="备件类别">{selectedPart.category}</Descriptions.Item>
                    <Descriptions.Item label="计量单位">{selectedPart.unit}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="存储仓库">{selectedPart.warehouse}</Descriptions.Item>
                    <Descriptions.Item label="当前库存">{selectedPart.stock}</Descriptions.Item>
                    <Descriptions.Item label="安全库存">{selectedPart.safetyStock}</Descriptions.Item>
                    <Descriptions.Item label="单价">¥{selectedPart.unitPrice}</Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="领用记录">
              <Table
                dataSource={selectedPart.issueRecords}
                columns={[
                  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
                  { title: '领用数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
                  { title: '领用人员', dataIndex: 'operator', key: 'operator', width: 100 },
                  { title: '关联工单', dataIndex: 'workOrderCode', key: 'workOrderCode', width: 140 },
                  { title: '趋势', key: 'trend', width: 80, render: (trend: string) => (
                    trend === 'up' ? <ArrowUpOutlined style={{ color: '#52c41a' }} /> :
                    trend === 'down' ? <ArrowDownOutlined style={{ color: '#ff4d4f' }} /> :
                    <MinusOutlined style={{ color: '#999' }} />
                  )},
                ]}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}