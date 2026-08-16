export const GenerateCertificate = (test)=>{
    return `
    
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCORE Certificate</title>
</head>
<body>

    <table id="scoreCertificate" style="margin: 0px auto;width: 1200px;font-family: 'Poppins', sans-serif;" width="800"
        height="500" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <table width="100%" style="background: #fff;">
                    <tr>
                        <td width="50%">
                            <img src="https://assets.infinitylearn.com/scoreonline/scorecertificate/scoreleft.webp"
                                style="width: 520px" height="" alt="scoreleft">
                        </td>
                        <td width="50%">
                            <table width="100%">
                                <tr>
                                    <td style="text-align: center;">
                                        <img src="https://assets.infinitylearn.com/scoreonline/scorecertificate/scorelogo.png"
                                            style="width: 380px;margin-bottom: 30px;" alt="">
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #00354E;font-size: 16px;font-weight: 500;text-align: center;">This
                                        Certificate Is Presented to:</td>
                                </tr>
                                <tr>
                                    <td>
                                        <h1
                                            style="margin: 10px 0px;color: #00354E;font-size: 26px;font-weight: 600;padding-bottom: 10px;border-bottom: 1px solid #00354E;text-align: center;">
                                            ${test?.firstName} ${test?.lastName}</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p
                                            style="color: #07193B;font-size: 16px;font-weight: 400;text-align: center;margin: 0px;">
                                            for successful participation in</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <h6
                                            style="color: #07193B;font-size: 20px;font-weight: 600;text-align: center;margin-bottom: 25px;">
                                            SCORE Online – India’s Largest Scholarship Exam.</h6>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p
                                            style="color: #07193B;font-size: 16px;font-weight: 400;text-align: center;margin: 0px;">
                                            Congratulations and good luck
                                            for your future endeavours.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="100%" style="margin: 50px 0;">
                                            <tr>
                                                <td width="40%" style="text-align: center;">
                                                    <p
                                                        style="color: #07193B;font-size: 14px;font-weight: 400;margin: 0px;width: 220px;text-align: center;padding-bottom: 20px;">
                                                        ${test?.date}</p>
                                                    <h5
                                                        style="color: #07193B;font-size: 14px;font-weight: 400;border-top: 1px solid #07193B;padding-top: 5px;margin: 0px;">
                                                        Date</h5>
                                                </td>
                                                <td width="20%" style="text-align: center;">
                                                    <img src="https://assets.infinitylearn.com/scoreonline/scorecertificate/badge.webp"
                                                        style="width: 80px;padding: 0px 10px;" alt="">
                                                </td>
                                                <td width="40%" style="text-align: center;">
                                                    <img src="https://assets.infinitylearn.com/scoreonline/scorecertificate/ujjwalsign.png"
                                                        style="width: 100px;" alt="seemasign">
                                                    <h5
                                                        style="color: #07193B;font-size: 14px;font-weight: 400;border-top: 1px solid #07193B;padding-top: 10px;margin: 0px;">
                                                        Ujjwal Singh</h5>
                                                    <p
                                                        style="color: #07193B;font-size: 11px;font-weight: 400;margin: 0px;">
                                                        Founding CEO</p>
                                                    <p
                                                        style="color: #07193B;font-size: 11px;font-weight: 400;margin: 0px;">
                                                        Infinity Learn by Sri Chaitanya</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
}