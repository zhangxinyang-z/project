

async function fetchEngineData() {
    try {
      const response = await fetch('http://localhost:8081/api/engines');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      return null; // 返回空数据避免页面崩溃
    }
  }

$(function () {
    echart_1();
    echart_2();
    echart_3();
    echart_4();

    javascript
复制
function echart_1() {
    const myChart = echarts.init(document.getElementById('chart_1'), 'dark');
    myChart.showLoading({
        text: '健康分析中...',
        color: '#98e002',
        textColor: '#fff',
        maskColor: 'rgba(8, 23, 42, 0.8)'
    });

    fetchEngineData().then(engines => {
        if (!engines || engines.length === 0) {
            myChart.hideLoading();
            renderEmptyChart(myChart);
            return;
        }

        // 动态阈值计算（保持原有逻辑）
        const sensor3Values = engines.map(e => e.data[e.data.length - 1].sensor3);
        const mean = sensor3Values.reduce((a, b) => a + b, 0) / sensor3Values.length;
        const std = Math.sqrt(sensor3Values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / sensor3Values.length);
        const threshold = mean + 2 * std;

        // 状态分类
        const statusData = engines.map(engine => {
            const lastCycle = engine.data[engine.data.length - 1];
            return (lastCycle.sensor3 > threshold || lastCycle.sensor4 < 1000) ? '故障' : '正常';
        });

        // 视觉配置
        const colorPalette = {
            normal: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#98e002' },
                { offset: 1, color: '#5cb300' }
            ]),
            warning: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#e72325' },
                { offset: 1, color: '#a31212' }
            ]),
            bg: 'rgba(8, 23, 42, 0.8)',
            text: '#fff'
        };

        const option = {
            backgroundColor: colorPalette.bg,
            title: {
                text: '引擎健康状态统计',
                left: '5%',
                top: 20,
                textStyle: {
                    color: colorPalette.text,
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily: 'Microsoft YaHei'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: params => `
                    <div style="font-weight:bold;color:${params.color}">${params.name}</div>
                    <div style="display:flex;justify-content:space-between;margin-top:5px;">
                        <span>数量:</span>
                        <span style="font-weight:bold;">${params.value}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>占比:</span>
                        <span style="font-weight:bold;">${params.percent}%</span>
                    </div>
                `,
                backgroundColor: 'rgba(8,23,42,0.9)',
                borderColor: '#1AA1FD',
                textStyle: { color: '#fff' },
                padding: 12
            },
            legend: {
                orient: 'horizontal',
                right: '10%',     
                bottom: 20,       
                itemGap: 15,      
                data: ['故障', '正常'],
                itemGap: 20,
                textStyle: {
                    color: colorPalette.text,
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                icon: 'circle',
                itemWidth: 12,
                itemHeight: 12
            },
            series: [{
                name: '健康状态',
                type: 'pie',
                radius: ['30%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: colorPalette.bg,
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                },
                label: {
                    show: true,
                    formatter: '{b|{b}}\n{d|{d}%}',
                    rich: {
                        b: {
                            color: colorPalette.text,
                            fontSize: 14,
                            fontWeight: 'bold',
                            padding: [0, 0, 5, 0]
                        },
                        d: {
                            color: colorPalette.text,
                            fontSize: 18,
                            fontWeight: 'bold'
                        }
                    }
                },
                emphasis: {
                    scale: true,
                    scaleSize: 10,
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                data: [
                    {
                        value: statusData.filter(s => s === '故障').length,
                        name: '故障',
                        itemStyle: { color: colorPalette.warning }
                    },
                    {
                        value: statusData.filter(s => s === '正常').length,
                        name: '正常',
                        itemStyle: { color: colorPalette.normal }
                    }
                ],
                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return Math.random() * 200;
                }
            }],
        };

        myChart.setOption(option);
        myChart.hideLoading();

        if (statusData.some(s => s === '故障')) {
            setTimeout(() => {
                myChart.dispatchAction({
                    type: 'highlight',
                    seriesIndex: 0,
                    dataIndex: 0
                });
            }, 800);
        }
    }).catch(() => {
        renderEmptyChart(myChart);
    });

    window.addEventListener("resize", () => myChart.resize());
}
    function echart_2() {
        const myChart = echarts.init(document.getElementById('chart_2'), 'dark');
        myChart.showLoading({
            text: '数据加载中...',
            color: '#1AA1FD',
            textColor: '#fff',
            maskColor: 'rgba(8, 23, 42, 0.8)'
        });
    
        fetchEngineData().then(engines => {
            if (!engines || engines.length === 0) {
                myChart.hideLoading();
                renderEmptyChart(myChart);
                return;
            }
    
            const showEngines = engines.slice(0, 6);
            const lastCycleData = showEngines.map(e => e.data[e.data.length - 1]);
    
            const colorPalette = {
                bar1: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#3FA7DC' },
                    { offset: 1, color: '#2468F2' }
                ]),
                bar2: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#7091C4' },
                    { offset: 1, color: '#4A5CAE' }
                ]),
                line: '#FF6B6B',
                bg: 'rgba(8, 23, 42, 0.8)'
            };
    
            const option = {
                backgroundColor: colorPalette.bg,
                title: {
                    text: '关键传感器值对比',
                    top: 15,
                    left: '5%',
                    textStyle: {
                        fontSize: 20,
                        color: '#fff',
                        fontWeight: 'bold',
                        fontFamily: 'Microsoft YaHei'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                        shadowStyle: {
                            color: 'rgba(26, 161, 253, 0.2)'
                        }
                    },
                    formatter: params => {
                        const title = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
                        const items = params.map(item => `
                            <div style="display:flex;align-items:center;">
                                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:5px;"></span>
                                ${item.seriesName}: <span style="font-weight:bold;margin-left:5px;">${item.value}</span>
                            </div>
                        `).join('');
                        return title + items;
                    },
                    backgroundColor: 'rgba(8,23,42,0.9)',
                    borderColor: '#1AA1FD',
                    textStyle: { color: '#fff' },
                    padding: [10, 15]
                },
                legend: {
                    data: ['sensor1', 'sensor2', 'sensor3'],
                    right: '5%',
                    top: 15,
                    icon: 'circle',
                    itemWidth: 12,
                    itemHeight: 12,
                    textStyle: {
                        color: '#fff',
                        fontSize: 12,
                        padding: [0, 5]
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    top: '25%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: showEngines.map(e => `引擎 ${e.engine_id}`),
                    axisLabel: {
                        color: '#7fbedc',
                        interval: 0,
                        rotate: 30,
                        fontSize: 12,
                        margin: 15
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(26, 161, 253, 0.6)',
                            width: 2
                        }
                    },
                    axisTick: {
                        alignWithLabel: true,
                        lineStyle: {
                            color: 'rgba(26, 161, 253, 0.3)'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: '#7fbedc',
                        fontSize: 12
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(26, 161, 253, 0.1)',
                            type: 'dashed'
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(26, 161, 253, 0.6)'
                        }
                    }
                },
                series: [
                    {
                        name: 'sensor1',
                        type: 'bar',
                        barGap: '10%',
                        data: lastCycleData.map(d => d.sensor1),
                        barWidth: 20,
                        itemStyle: {
                            color: colorPalette.bar1,
                            borderRadius: [4, 4, 0, 0],
                            shadowColor: 'rgba(63, 167, 220, 0.5)',
                            shadowBlur: 6,
                            shadowOffsetY: 3
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#fff',
                            fontSize: 12,
                            formatter: '{c}',
                            fontWeight: 'bold'
                        },
                        emphasis: {
                            itemStyle: {
                                shadowColor: 'rgba(63, 167, 220, 0.8)',
                                shadowBlur: 10
                            }
                        }
                    },
                    {
                        name: 'sensor2',
                        type: 'bar',
                        data: lastCycleData.map(d => d.sensor2),
                        barWidth: 20,
                        itemStyle: {
                            color: colorPalette.bar2,
                            borderRadius: [4, 4, 0, 0],
                            shadowColor: 'rgba(112, 145, 196, 0.5)',
                            shadowBlur: 6,
                            shadowOffsetY: 3
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#fff',
                            fontSize: 12,
                            formatter: '{c}',
                            fontWeight: 'bold'
                        },
                        emphasis: {
                            itemStyle: {
                                shadowColor: 'rgba(112, 145, 196, 0.8)',
                                shadowBlur: 10
                            }
                        }
                    },
                    {
                        name: 'sensor3',
                        type: 'line',
                        data: lastCycleData.map(d => d.sensor3),
                        symbol: 'circle',
                        symbolSize: 10,
                        lineStyle: {
                            width: 4,
                            color: colorPalette.line,
                            shadowColor: 'rgba(255, 107, 107, 0.3)',
                            shadowBlur: 10,
                            shadowOffsetY: 5
                        },
                        itemStyle: {
                            color: '#fff',
                            borderColor: colorPalette.line,
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                            formatter: params => params.value > 100 ? params.value : ''
                        },
                        emphasis: {
                            lineStyle: {
                                width: 5
                            }
                        }
                    }
                ]
            };
    
            myChart.setOption(option);
            myChart.hideLoading();
    
        }).catch(() => {
            renderEmptyChart(myChart);
        });
    
        window.addEventListener("resize", () => myChart.resize());
    }       
    /* function echart_3() {
            var myChart = echarts.init(document.getElementById('chart_3'));
        
            // 动态加载弋江区地图数据
            fetch('/map/弋江区.json')
                .then(response => response.json())
                .then(yijiangJson => {
                    // 注册地图
                    echarts.registerMap('yijiang', yijiangJson);
        
                    // 定义弋江区坐标和数据
                    var geoCoordMap = {
                        '弋江区A': [118.377, 31.335],
                        '弋江区B': [118.382, 31.328]
                    };
                    var data = [
                        { name: '弋江区A', value: 100 },
                        { name: '弋江区B', value: 200 }
                    ];
        
                    // 转换数据格式
                    var convertData = function (data) {
                        var res = [];
                        for (var i = 0; i < data.length; i++) {
                            var geoCoord = geoCoordMap[data[i].name];
                            if (geoCoord) {
                                res.push({
                                    name: data[i].name,
                                    value: geoCoord.concat(data[i].value)
                                });
                            }
                        }
                        return res;
                    };
        
                    // 配置地图选项
                    myChart.setOption({
                        title: {
                            text: '弋江区设备分布',
                            // ...其他配置...
                        },
                        geo: {
                            map: 'yijiang',
                            roam: true,
                            itemStyle: {
                                normal: {
                                    areaColor: '#031525',
                                    borderColor: '#00c1de'
                                },
                                emphasis: {
                                    areaColor: '#2B91B7'
                                }
                            }
                        },
                        series: [
                            {
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                symbol: 'pin',
                                symbolSize: 30,
                                data: convertData(data),
                                itemStyle: {
                                    normal: {
                                        color: '#F62157'
                                    }
                                }
                            },
                            // ...其他图层配置...
                        ]
                    });
                })
                .catch(error => {
                    console.error('加载弋江区地图失败:', error);
                });
        
            // 窗口缩放时重置图表大小
            window.addEventListener("resize", function () {
                myChart.resize();
            });
        }*/
            function echart_3() {
                var myChart = echarts.init(document.getElementById('chart_3'));
                
                myChart.showLoading({
                    text: '数据加载中...',
                    color: '#98e002',
                    textColor: '#fff',
                    maskColor: 'rgba(8, 23, 42, 0.8)'
                });
                
                // 动态获取数据
                fetchEngineData().then(engines => {
                  if (!engines || engines.length === 0) {
                    myChart.hideLoading();
                    return;
                  }
                  
                  // 取第一个设备的数据
                  const engineData = engines[0].data;
                  
                  // 配置图表选项
                  const option = {
                    title: {
                      text: '发动机操作设置趋势',
                      textStyle: { color: '#fff', fontSize: 18 },
                      left: 20,
                      top: 25
                    },
                    tooltip: { trigger: 'axis' },
                    legend: {
                      data: ['op_setting1', 'op_setting2'],
                      textStyle: { color: '#fff' },
                      right: 20,
                      top: 35
                    },
                    xAxis: {
                      type: 'category',
                      data: engineData.map(d => `Cycle ${d.cycle}`),
                      axisLabel: { color: '#fff' }
                    },
                    yAxis: { 
                      type: 'value',
                      axisLabel: { color: '#fff' }
                    },
                    series: [
                      {
                        name: 'op_setting1',
                        type: 'line',
                        data: engineData.map(d => d.op_setting1),
                        smooth: true,
                        itemStyle: { color: '#98e002' }
                      },
                      {
                        name: 'op_setting2',
                        type: 'line',
                        data: engineData.map(d => d.op_setting2),
                        smooth: true,
                        itemStyle: { color: '#2ca3fd' }
                      }
                    ]
                  };
                  
                  myChart.setOption(option);
                  myChart.hideLoading();
                });
              
                // 窗口缩放适配
                window.addEventListener("resize", () => myChart.resize());
              }

        // 异步获取数据
        function echart_4() {
            const dom = document.getElementById('chart_4');
            dom.style.height = '4.4rem';
        
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js';
            script.onload = () => init3DEngine();
            document.head.appendChild(script);
        
            function init3DEngine() {
                const chart = echarts.init(dom);
                
                fetchEngineData().then(engines => {
                    if (!engines || engines.length === 0) {
                        renderFallback(dom);
                        return;
                    }
        
                    const engine = engines[0];
                    if (!engine.data || engine.data.length === 0) {
                        renderFallback(dom);
                        return;
                    }
        
                    // 数据处理
                    const processData = (data) => {
                        return data.map(d => [
                            Math.round(d.sensor3),  
                            Math.round(d.sensor4),  
                            Math.round(d.sensor5),  
                            d.cycle
                        ]);
                    };

                    const sortedData = engine.data.sort((a, b) => a.cycle - b.cycle);
                    const points = processData(sortedData.filter((_, i) => i % 3 === 0));
        

                    const calcRange = (axisIndex) => {
                        const values = points.map(p => p[axisIndex]);
                        const min = Math.min(...values);
                        const max = Math.max(...values);
                        const range = max - min || 1; 
                        return [min - range * 0.15, max + range * 0.15];
                    };
        
                    const generateContainerSurface = () => {
                        const xRange = calcRange(0);
                        const yRange = calcRange(1);
                        const zRange = calcRange(2);
                        
                        return {
                            type: 'surface',
                            wireframe: { show: true },
                            itemStyle: { color: 'rgba(26,161,253,0.1)' },
                            parametric: true,
                            parametricEquation: {
                                u: { min: 0, max: 1 },
                                v: { min: 0, max: 1 },
                                x: (u, v) => xRange[0] + (xRange[1] - xRange[0]) * u,
                                y: (u, v) => yRange[0] + (yRange[1] - yRange[0]) * v,
                                z: () => zRange[1] 
                            }
                        };
                    };
        
                    const option = {
                        tooltip: {
                            formatter: params => `
                                Cycle: ${params.value[3]}<br>
                                温度: ${params.value[0].toFixed(1)}<br>
                                压力: ${params.value[1].toFixed(1)}<br>
                                转速: ${params.value[2].toFixed(1)}
                            `
                        },
                        xAxis3D: {
                            type: 'value',
                            name: '温度',
                            min: calcRange(0)[0],
                            max: calcRange(0)[1],
                            axisLine: { lineStyle: { color: '#1AA1FD', width: 4 }}
                        },
                        yAxis3D: {
                            type: 'value',
                            name: '压力',
                            min: calcRange(1)[0],
                            max: calcRange(1)[1],
                            axisLine: { lineStyle: { color: '#1AA1FD', width: 4 }}
                        },
                        zAxis3D: {
                            type: 'value',
                            name: '转速',
                            min: calcRange(2)[0],
                            max: calcRange(2)[1],
                            axisLine: { lineStyle: { color: '#1AA1FD', width: 4 }}
                        },
                        grid3D: {
                            viewControl: {
                                autoRotate: true,
                                autoRotateSpeed: 8,
                                distance: 180,
                                elevation: 30 
                            },
                            light: {
                                main: { intensity: 1.8, shadow: true },
                                ambient: { intensity: 0.6 }
                            }
                        },
                        series: [
                            generateContainerSurface(),
                            {
                                type: 'scatter3D',
                                data: points,
                                symbolSize: 14,
                                itemStyle: {
                                    color: params => {
                                        const zVal = params.value[2];
                                        return zVal > calcRange(2)[1]*0.8 ? '#e72325' : 
                                               zVal > calcRange(2)[1]*0.5 ? '#f8b448' : '#2ca3fd';
                                    },
                                    opacity: 0.8,
                                    borderColor: '#fff',
                                    borderWidth: 1
                                },
                                emphasis: {
                                    itemStyle: {
                                        opacity: 1,
                                        borderWidth: 2
                                    }
                                }
                            },
                            {
                                type: 'line3D',
                                data: points,
                                lineStyle: {
                                    width: 1.5,
                                    color: 'rgba(19,208,178,0.6)',
                                    opacity: 0.8
                                },
                                effect: {
                                    show: true,
                                    trailLength: 0.2,
                                    symbol: 'arrow',
                                    symbolSize: 4,
                                    color: '#13D0B2'
                                }
                            }
                        ]
                    };
        
                    chart.setOption(option);
                    window.addEventListener('resize', () => chart.resize());
                }).catch(() => renderFallback(dom));
            }
        
            function renderFallback(dom) {
                dom.innerHTML = `
                    <div style="
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        color: #e72325;
                        background: rgba(23,42,85,0.7);
                        border: 1px solid #1AA1FD;
                        border-radius: 4px;
                    ">
                        <div style="font-size:0.3rem;">⚠️</div>
                        <div style="font-size:0.16rem;margin-top:0.1rem;">3D引擎加载失败</div>
                        <button onclick="echart_4()" style="
                            margin-top:0.1rem;
                            background:#2ca3fd;
                            border:none;
                            padding:0.05rem 0.1rem;
                            border-radius:0.04rem;
                            color:white;
                            font-size:0.14rem;
                        ">重试</button>
                    </div>
                `;
            }
        }

        function refreshData() {
            fetchEngineData().then(engines => {
              if (!engines) return;
          
              // 更新调试面板
              $('#debug-engine-id').text(engines[0]?.engine_id || '-');
              $('#debug-cycle').text(engines[0]?.data?.[engines[0].data.length-1]?.cycle || '-');
              
              // 重新渲染所有图表
              echart_1(); 
              echart_2();
              echart_3(); 
              echart_4();
            });
          }
          
          // 初始加载
          $(document).ready(function(){
            refreshData();
          });
});