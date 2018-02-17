/* ---------- NEED TO BE INCLUDED BEFORE getCarousel.js ----------

/**
 * Create the chart for the graphic view
 * @param {*} peopleData people data in a list form
 */
function createChart(peopleData){
    peopleNameList = new Array();
    peopleScoreList = new Array();

    peopleData.forEach(element => {
        peopleNameList.push(element['name']);
    });

    peopleData.forEach(element => {
        peopleScoreList.push(0);
    });

    var chartView = Highcharts.chart('container', {
        chart: {
            polar: true,
            type: 'line'
        },
    
        title: {
            text: 'People Score',
            x: -80
        },
    
        pane: {
            size: '95%'
        },
    
        animation: {
            duration: 500
        },

        xAxis: {
            categories: peopleNameList,
            tickmarkPlacement: 'on',
            lineWidth: 0
        },
    
        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },
    
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },
    
        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 70,
            layout: 'vertical'
        },
    
        series: [{
            name: 'Matching Score',
            data: peopleScoreList,
            pointPlacement: 'on'
        }]
    });
    return chartView;
}
