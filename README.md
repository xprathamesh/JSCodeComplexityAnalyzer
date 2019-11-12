### Code Complexity Analysis using Esprima

[Esprima](https://esprima.org/) is a high performance, standard-compliant ECMAScript parser written in ECMAScript. It generates AST's (Abstract Syntax Trees) that can be used for performing lexical or syntactic analysis.

This project demonstrates the complexity analysis of JavaScript Code using Esprima

The following functionalities have been implemented as of now:
   
   Per Function:

   * **ParameterCount**: The number of parameters for function.
   * **Returns**: The number of return statements in function.

   For File:

   * **AllComparisons**: The total number of comparision operators (`>`, `<`, `>=`, `<=`) in file.
   * **String Usage**: How many string literals are used in file.
   * **PackageComplexity**: The number of imports used in file ( `require("...")` ).
   
   Using Multiple Visitors:
   
   * **SimpleCyclomaticComplexity**: The number of if statements/decision nodes/loops + 1.
   * **MaxMessageChains**: The max length of a message chain in a function. A message chain can be formed from a data access (.), or array access [n].
   
   For example,

     ```javascript
     // Message Chain: 4
     mints.name.toString().split(".")[0];
     ```
   Advanced:
   * **MaxConditions**: The max number of condition predicates (expressions seperated by `||`, `&&`) in an if statement.


Run the program and print all the tokens in an ast.
   ```
      npm install
      node analysis.js
      or
      node analysis.js mystery.js
   ```

Challenge:
Try implementing the folowing:
   * **MaxNestingDepth**: The max depth of scopes (nested ifs, loops, etc) -- this one is hard, only expect a few to get to do finish this one.

The code for the above is available in [analysis.js](/analysis.js), within the complexity function.

Output after running complexity for [mystery.js](/mystery.js)

<img src="/mysteryoutput.PNG"></img>
