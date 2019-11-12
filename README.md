# HW2

### CSC 510 Software Engineering - HW2

Complete and extend the workshop to solve the following measures:

1. Do simple calculations (60 points)

   Per Function:

   * **ParameterCount**: The number of parameters for function.
   * **Returns**: The number of return statements in function.

   For File:

   * **AllComparisons**: The total number of comparision operators (`>`, `<`, `>=`, `<=`) in file.
   * **String Usage**: How many string literals are used in file.
   * **PackageComplexity**: The number of imports used in file ( `require("...")` ).

2. Using multiple visitors (40 points).

   * **SimpleCyclomaticComplexity**: The number of if statements/decision nodes/loops + 1.
   * **MaxMessageChains**: The max length of a message chain in a function. A message chain can be formed from a data access (.), or array access [n].

     For example,

     ```javascript
     // Message Chain: 4
     mints.name.toString().split(".")[0];
     ```

## Submission

The code for the above is available at [analysis.js](/analysis.js), within the complexity function.

Output after running complexity for [mystery.js](/mystery.js)

<img src="/mysteryoutput.PNG"></img>
