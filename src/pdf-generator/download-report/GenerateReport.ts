import { generateChartImage } from "./generateChartImage";
export const GenerateReport = async (testData, reportData)=>{
    reportData?.sections?.map(subject => {
        subject.icon = `${subject?.SECTION?.toLowerCase()?.replace(/[^a-z]/gi, "")}`;
        subject.percentage = `${(subject?.MARKS_ACHIEVED / subject?.TOTAL_MARKS) * 100}%`;
    });
    const subjectPerformance = reportData?.sections?.filter((sec)=> sec?.SUBJECT_PERFORMANCE?.toLowerCase() == "best" ||  sec?.SUBJECT_PERFORMANCE?.toLowerCase() == "scope for improvement");
    const performanceHtml = subjectPerformance?.map(sub =>{
        if(sub?.SUBJECT_PERFORMANCE?.toLowerCase() == "best"){
            return `
                        <div>
                            <div class="perform_webflex">
                                <div>
                                    <figure class="mb-0">
                                        <img src="https://score-cdn-devinfinitylearn.s3.ap-south-1.amazonaws.com/Ilwebsite/score2023/scorereport/subone.svg" alt="subone">
                                    </figure>
                                </div>
                                <div class="perform_mobflex">
                                    <h3 class="SCRPT-icnhdng no_mb">Best subject:</h3>
                                    <h4 class="SCRPT-cunt SCRPT-elips">${sub?.SECTION}</h4>
                                </div>
                            </div>
                        </div>
            `
        } else if(sub?.SUBJECT_PERFORMANCE?.toLowerCase() == "scope for improvement"){
            return `
            <div>
                            <div class="perform_webflex">
                                <div>
                                    <figure class="mb-0">
                                        <img src="https://score-cdn-devinfinitylearn.s3.ap-south-1.amazonaws.com/Ilwebsite/score2023/scorereport/subtwo.svg" alt="subtwo">
                                    </figure>
                                </div>
                                <div class="perform_mobflex">
                                    <h3 class="SCRPT-icnhdng no_mb">Scope of improvement:</h3>
                                    <h4 class="SCRPT-cunt SCRPT-elips">${sub?.SECTION}</h4>
                                </div>
                            </div>
                        </div>
            `
        }
    }).join('');

    const subjectWiseHtml = reportData?.sections?.map(subject =>  `
<div>
    <div class="scr-sldr-area">
        <h3 class="SCRPT-icnhdng no_mb">${subject?.SECTION}</h3>
        <div class="sr_progressflex">
            <div>
                <div class="new-custom-progress-bar">
                    <div class=${subject?.MARKS_ACHIEVED <=0 ? 'mental-new-your-score-bar' : 'new-your-score-bar' }
                        style=${{width: subject?.MARKS_ACHIEVED==0 ? '10%' : subject?.percentage}}>
                        ${(subject?.MARKS_ACHIEVED == 0 || subject?.MARKS_ACHIEVED == null) ? 0
                        : subject?.MARKS_ACHIEVED <= 0 ? subject?.MARKS_ACHIEVED : '' }</div>
                    </div>
                </div>
                <div>
                    <div class=${ subject?.MARKS_ACHIEVED < 0 ? 'mental-scr-info-cunt' : 'scr-info-cunt' }>
                        ${subject?.MARKS_ACHIEVED == null ? 0 : subject?.MARKS_ACHIEVED}<span
                            class="scr-light-txt">/${subject?.TOTAL_MARKS}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `
    ).join('');

    const subjectBreakDown = await subjectBreakDownHtml(reportData?.sections)

    const chartImage = await generateChartImage([reportData?.exam_details?.[0]?.CORRECT,reportData?.exam_details?.[0]?.INCORRECT,reportData?.exam_details?.[0]?.UNATTEMPTED]); 
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2024 Online Score Report</title>
    <link rel="icon" type="image/x-icon" href="images/chandigarh/favicon.ico">
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" />
    <!-- Home css  -->
    <link rel="stylesheet"
        href="https://assets.infinitylearn.com/scoreonline/css/onlinehome.css" />
    <!-- font awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
    <!-- font style -->
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700&display=swap" />
</head>

<body>

    <div id="scoreReport">
        <!-- page 1 open -->
        <div class="SCRPT-page-wrap">
            <div class="SCRPT-hdr-area">
                <div class="row justify-content-between align-center">
                    <div class="col-auto">
                        <a href="#">
                            <figure class="mb-0">
                                <img src="https://assets.infinitylearn.com/score-report/iltoilogo1.png"
                                    class="SCRPT-logo" />
                            </figure>
                        </a>
                    </div>
                </div>
            </div>
            <div class="SCRPT-body-area firstpage">
                <div className="SCRPT-sctn-hdng-area mb-3">
                    <h4 className="name_heading">Name : <strong>${testData?.firstName} ${testData?.lastName}</strong> |
                        Grade : <strong>${testData?.grade}</strong></h4>
                </div>
                <div class="SCRPT-score-prgrss-area mt-3">
                    <div class="SCRPT-sctn-hdng-area">
                        <h4 class="sr_subtitle">Overview</h4>
                    </div>
                    <div class="SCRPT-subjct-wsh-area">
                        <div class="sr_whiteoverview">
                            <div class="flexone_border one_border">
                                <h3 class="SCRPT-icnhdng">Score</h3>
                                <div class="scr-info-cunt">
                                    ${reportData?.exam_details?.[0]?.CURRENT_MARKS}<span
                                        class="scr-light-txt">/${reportData?.exam_details?.[0]?.MAX_MARKS_PER_EXAM}
                                        marks</span>
                                </div>
                            </div>
                            <div class="flexone_border">
                                <div class="sr_insideflex">
                                    <div>
                                        <h3 class="SCRPT-icnhdng">Accuracy</h3>
                                        <h4 class="SCRPT-cunt SCRPT-elips">${reportData?.exam_details?.[0]?.ACCURACY ?
                                            reportData?.exam_details?.[0]?.ACCURACY?.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}%</h4>
                                    </div>
                                    <div>
                                        <h3 class="SCRPT-icnhdng">Total Time</h3>
                                        <h4 class="SCRPT-cunt SCRPT-elips">
                                            ${getTimeFormatForTM(reportData?.exam_details?.[0]?.TOTAL_TIME_TAKEN)}</h4>
                                    </div>
                                    <div>
                                        <h3 class="SCRPT-icnhdng">Avg. time/Question</h3>
                                        <h4 class="SCRPT-cunt SCRPT-elips">
                                            ${getTimeFormatForTM(reportData?.exam_details?.[0]?.AVG_TIME_TAKEN)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="SCRPT-score-whitetbx crt-incrt-chrtbx smview">
                            <div class="row">
                                <div class="col-md-12 col-lg-12 col-12">
                                    <h4 class="SCRPT-sctn-hdng sm-hdng">Questions Attempted</h4>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-5 col-4">
                                    <div class="SCRPT-chrtarea">
                                        <div style="margin-top: 15px;margin-left: 30px">
                                            <img src="${chartImage}" style="width: 120px; height: 120px; margin: 0 auto">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-7 col-8">
                                    <ul class="chrt-infolist">
                                        <li>
                                            <div class="SCRPT-scr-infobx lstview">
                                                <h2 class="scr-info-titl"><span class="crt-dot green"></span>Correct:</h2>
                                                <div class="scr-info-cunt">
                                                    ${reportData?.exam_details?.[0]?.CORRECT}<span
                                                        class="scr-light-txt">/${reportData?.exam_details?.[0]?.TOTAL_QUESTIONS}</span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="SCRPT-scr-infobx lstview">
                                                <h2 class="scr-info-titl"><span class="crt-dot red"></span>Incorrect:</h2>
                                                <div class="scr-info-cunt">
                                                    ${reportData?.exam_details?.[0]?.INCORRECT}<span
                                                        class="scr-light-txt">/${reportData?.exam_details?.[0]?.TOTAL_QUESTIONS}</span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="SCRPT-scr-infobx lstview">
                                                <h2 class="scr-info-titl"><span class="crt-dot"></span>Not-attempted:</h2>
                                                <div class="scr-info-cunt">
                                                    ${reportData?.exam_details?.[0]?.UNATTEMPTED}<span
                                                        class="scr-light-txt">/${reportData?.exam_details?.[0]?.TOTAL_QUESTIONS}</span>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="SCRPT-sctn-hdng-area">
                        <h4 class="sr_subtitle">Subject Performance</h4>
                    </div>
                    <div class="perform_box">
                        ${performanceHtml}
                    </div>

                    <div class="SCRPT-score-box">
                        <div class="SCRPT-score-hdng-area">
                            <h4 class="SCRPT-sctn-hdng sm-hdng">Subjectwise Score</h4>
                        </div>
                        <div class="sr_sub_grid">
                            ${subjectWiseHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- page 1 closed -->
        ${subjectBreakDown}
    </div>

    <!-- scripts starts-->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js"></script>
</body>

</html>
    `
}

export const subjectBreakDownHtml = async(sections) => {
    const htmlSections = await Promise.all(sections?.map(async (subject, index) => {
        const chartImage = await generateChartImage([subject?.CORRECT, subject?.INCORRECT, subject?.UNATTEMPTED]); 
        return `
            <div class="SCRPT-page-wrap">
                <div class="page_break">
                    <div class="SCRPT-score-prgrss-area">
                        ${index === 0 ? `<div class="SCRPT-sctn-hdng-area">
                            <h4 class="sr_subtitle">Subject-wise breakdown</h4>
                        </div>` : ``}
                        <div class="subject_show">
                            <p class="rp_subname"><span><img
                                src=${`https://assets.infinitylearn.com/score-report/icons/subject-icons/${subject?.icon}-icon.svg`}
                                class="rpscore_sub" alt="subjects"></span>&nbsp;${subject?.SECTION}</p>
                        </div>
                        <div class="SCRPT-subjct-wsh-area">
                            <div class="rp_scoreoverview">
                                <div class="flexone_border_show one_border">
                                    <div class="score__show_one">
                                        <div>
                                            <figure class="mb-0">
                                                <img src="https://assets.infinitylearn.com/scoreofflinereport2024/score.svg"
                                                    class="score__icon" alt="score">
                                            </figure>
                                        </div>
                                        <div>
                                            <h3 class="SCRPT-icnhdng">Score</h3>
                                            <div class="scr-info-cunt">
                                                ${subject?.MARKS_ACHIEVED}<span class="scr-light-txt">/${subject?.TOTAL_MARKS}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="score__show_two">
                                        <div>
                                            <figure class="mb-0">
                                                <img src="https://assets.infinitylearn.com/scoreofflinereport2024/target.svg"
                                                    class="score__icon" alt="score">
                                            </figure>
                                        </div>
                                        <div>
                                            <h3 class="SCRPT-icnhdng">Accuracy</h3>
                                            <h4 class="SCRPT-cunt SCRPT-elips">${subject?.ACCURACY ? subject?.ACCURACY.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}%</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="flexone_border_show">
                                    <div class="sr_insideflex_three">
                                        <div>
                                            <figure class="mb-0">
                                                <img src="https://assets.infinitylearn.com/scoreofflinereport2024/time.svg"
                                                    class="target__icon" alt="target">
                                            </figure>
                                        </div>
                                        <div>
                                            <h3 class="SCRPT-icnhdng">Total Time taken</h3>
                                            <h4 class="SCRPT-cunt SCRPT-elips">${getTimeFormatForTM(subject?.TOTAL_TIME_TAKEN)}</h4>
                                        </div>
                                    </div>
                                    <div class="sr_insideflex_four">
                                        <div>
                                            <figure class="mb-0">
                                                <img src="https://assets.infinitylearn.com/scoreofflinereport2024/time.svg"
                                                    class="target__icon" alt="target">
                                            </figure>
                                        </div>
                                        <div>
                                            <h3 class="SCRPT-icnhdng">Avg. time/ Question</h3>
                                            <h4 class="SCRPT-cunt SCRPT-elips">${getTimeFormatForTM(subject?.AVG_TIME_TAKEN)}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="SCRPT-score-whitetbx crt-incrt-chrtbx smview">
                                <div class="row">
                                    <div class="col-md-5 col-4">
                                        <div class="SCRPT-chrtarea">
                                            <div style="margin-top: 15px;margin-left: 30px">
                                            <img src="${chartImage}" Chart" style="width: 110px; height: 110px; margin: 0 auto">
                                        </div>
                                        </div>
                                    </div>
                                    <div class="col-md-7 col-8">
                                        <ul class="chrt-infolist">
                                            <li>
                                                <div class="SCRPT-scr-infobx lstview">
                                                    <h2 class="scr-info-titl"><span class="crt-dot green"></span>Correct:</h2>
                                                    <div class="scr-info-cunt"> ${subject?.CORRECT}<span class="scr-light-txt">/${subject?.TOTAL_QUESTIONS}</span></div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="SCRPT-scr-infobx lstview">
                                                    <h2 class="scr-info-titl"><span class="crt-dot red"></span>Incorrect:</h2>
                                                    <div class="scr-info-cunt"> ${subject?.INCORRECT}<span class="scr-light-txt">/${subject?.TOTAL_QUESTIONS}</span></div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="SCRPT-scr-infobx lstview">
                                                    <h2 class="scr-info-titl"><span class="crt-dot"></span>Not-attempted:</h2>
                                                    <div class="scr-info-cunt">${subject?.UNATTEMPTED}<span class="scr-light-txt">/${subject?.TOTAL_QUESTIONS}</span></div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${subject?.chapters?.length > 0 ? `<div class="subject_show">
                            <p class="rp_subname">Chapter Insights</p>
                        </div>` : ``}
                        ${subject?.chapters?.length > 0 ? `<div class="SCRPT-score-whitetbx crt-incrt-chrtbx smview">
                            <div class="table-responsive">
                                <table class="table table-borderless report__table">
                                    <thead>
                                        <tr>
                                            <td>Chapters</td>
                                            <td class="text-center">Total Qs</td>
                                            <td class="text-center">Correct/Wrong/Unattempted</td>
                                            <td class="text-center">Marks Achieved</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${chapterHtml(subject?.chapters?.slice(0,15))}
                                    </tbody>
                                </table>
                            </div>
                        </div>` : ``}
                    </div>
                </div>
            </div>

            ${subject?.chapters?.length > 15 ? `<div class="SCRPT-page-wrap">
                <div class="page_break">
                    <div class="SCRPT-score-prgrss-area">
                        <div class="subject_show">
                            <p class="rp_subname"><span><img
                                src=${`https://assets.infinitylearn.com/score-report/icons/subject-icons/${subject?.icon}-icon.svg`}
                                class="rpscore_sub" alt="subjects"></span>&nbsp;${subject?.SECTION}</p>
                        </div>
                        <div class="SCRPT-score-whitetbx crt-incrt-chrtbx smview">
                            <div class="table-responsive">
                                <table class="table table-borderless report__table">
                                    <thead>
                                        <tr>
                                            <td>Chapters</td>
                                            <td class="text-center">Total Qs</td>
                                            <td class="text-center">Correct/Wrong/Unattempted</td>
                                            <td class="text-center">Marks Achieved</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${chapterHtml(subject?.chapters?.slice(15,30))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>` : ``}
        `;
    }));

    return htmlSections.join('');
}


export const chapterHtml = (chapters)=>{
  return  chapters?.map(chapter =>{
        return `
    <tr>
    <th>${chapter?.CHAPTER} <br /><small class=${chapter?.CHAPTER_CATEGORY?.toLowerCase()=='improve' ? 'improve'
            : 'keepitup' }>${chapter?.PERFORMANCE_METRICS}</small></th>
    <td class="text-center">${chapter?.TOTAL_QUESTIONS_ASKED}</td>
    <td class="text-center">
        <p class="rp__scorechecks"><span><img src="https://assets.infinitylearn.com/scoreofflinereport2024/correct.svg" class="rp_checkicons"
                    alt="correct" />&nbsp;&nbsp;${chapter?.QUESTION_STATUS_CORRECT}</span>
            <span><img src="https://assets.infinitylearn.com/scoreofflinereport2024/wrong.svg" class="rp_checkicons"
                    alt="wrong" />&nbsp;&nbsp;${chapter?.QUESTION_STATUS_WRONG}</span>
            <span><img src="https://assets.infinitylearn.com/scoreofflinereport2024/unattemped.svg" class="rp_checkicons"
                    alt="unattemped" />&nbsp;&nbsp;${chapter?.QUESTION_STATUS_UNATTEMPTED}</span>
        </p>
    </td>
    <td class="text-center"><strong>${chapter?.MARKS_SCORED}</strong> / ${chapter?.TOTAL_MARKS}</td>
</tr>
        `
    }).join('')
}

export const getTimeFormatForTM = (sec)=>{
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    let time = "";
    if (hours > 0) {
      time += hours + "h ";
    }
    if (minutes > 0) {
      time += minutes + "m ";
    }
    if (seconds > 0) {
      time += Math.floor(seconds) + "s ";
    }
    if(hours == 0 && minutes == 0 && seconds == 0){
      time = "0s";
    }
    return time;
  }