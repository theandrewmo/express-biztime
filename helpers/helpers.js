export function convertResponseData(responseData) {
    const industryMap = new Map();
  
    // Iterate over the response data and populate the industry map
    for (const data of responseData) {
      const { industry_code, industry, code } = data;
      if (!industryMap.has(industry_code)) {
        industryMap.set(industry_code, [code]);
      } else {
        industryMap.get(industry_code).push(code);
      }
    }
  
    // Create an array of objects with the desired format
    const industries = [];
    for (const [industry_code, companyCodes] of industryMap) {
      const { industry } = responseData.find((data) => data.industry_code === industry_code);
      industries.push({
        industry_code,
        industry,
        company_codes: companyCodes.filter((code) => code !== null),
      });
    }
    return industries;
  }

  