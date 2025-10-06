$(function() {
    // 初始化图表
    initCharts();
    // 启动数据轮询
    startPolling();
    // 更新时间显示
    updateSystemTime();
});

// 全局变量
let realtimeChart, historyChart;

function initCharts() {
    realtimeChart = echarts.init(document.getElementById('realtimeChart'), 'dark');
    historyChart = echarts.init(document.getElementById('historyChart'), 'dark');
    
    // 实时图表配置（与echarts_index.js风格一致）
    realtimeChart.setOption({
        backgroundColor: 'rgba(8, 23, 42, 0.8)',
        title: { 
            text: '实时传感器数据流',
            textStyle: { color: '#fff', fontSize: 18 }
        },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [{
            type: 'line',
            smooth: true,
            itemStyle: { color: '#36a3f7' },
            areaStyle: { color: 'rgba(54, 163, 247, 0.1)' }
        }]
    });

    // 历史图表配置
    historyChart.setOption({
        backgroundColor: 'rgba(8, 23, 42, 0.8)',
        title: { 
            text: '历史趋势分析',
            textStyle: { color: '#fff', fontSize: 18 }
        },
        tooltip: { trigger: 'axis' },
        legend: { data: ['温度', '湿度', '距离'], textStyle: { color: '#fff' } },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [
            { name: '温度', type: 'line', smooth: true, itemStyle: { color: '#ff4757' } },
            { name: '湿度', type: 'line', smooth: true, itemStyle: { color: '#2ed573' } },
            { name: '距离', type: 'line', smooth: true, itemStyle: { color: '#3742fa' } }
        ]
    });
}

function fetchRealtimeData() {
    $.ajax({
        url: '/api/sensor/realtime',
        success: function(data) {
            // 更新卡片数据
            $('#temperature').text(data.temperature || '--');
            $('#humidity').text(data.humidity || '--');
            
            // 更新实时图表
            const option = {
                xAxis: { 
                    data: [...realtimeChart.getOption().xAxis[0].data, moment().format('HH:mm:ss')].slice(-20) 
                },
                series: [{
                    data: [...realtimeChart.getOption().series[0].data, data.temperature].slice(-20)
                }]
            };
            realtimeChart.setOption(option);
        }
    });
}

function updateSystemTime() {
    $('#currentTime').text(moment().format('YYYY-MM-DD HH:mm:ss'));
    setTimeout(updateSystemTime, 1000);
}

function startPolling() {
    fetchRealtimeData();
    setInterval(fetchRealtimeData, 2000);
}

// 窗口resize事件
window.addEventListener('resize', function() {
    realtimeChart && realtimeChart.resize();
    historyChart && historyChart.resize();
});