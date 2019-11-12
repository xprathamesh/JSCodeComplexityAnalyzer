var esprima = require("esprima");
var options = { tokens:true, tolerant:true, loc:true, range:true };
var fs = require("fs");

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["analysis.js"];
	}
	var filePath = args[0];
	
	complexity(filePath);

	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}

}



var builders = {};

// Represent a reusable "class" following the Builder pattern.
function FunctionBuilder()
{
	this.StartLine = 0;
	this.FunctionName = "";
	// The number of parameters for functions - Workshop & HW2
	this.ParameterCount = 0,
	// Number of if statements/loops + 1 - Workshop & HW2
	this.SimpleCyclomaticComplexity = 0; 
	// The max depth of scopes (nested ifs, loops, etc) - HW2
	this.MaxNestingDepth = 0;
	// The max number of conditions in one decision statement. - Workshop
	this.MaxConditions = 0;
	// Number of Return Statements in the function - HW2
	this.Returns = 0
	// The max length of a message chain in a function. A message chain can be formed from a data access (.), or array access [n] - HW2
	this.MaxMessageChains = 0

	this.report = function()
	{
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
			   "SimpleCyclomaticComplexity: {2}\t" +
				"MaxNestingDepth: {3}\t" +
				"MaxConditions: {4}\t" +
				"MaxMessageChains: {5}\t" +
				"Parameters: {6}\t" +
				"Returns: {7}\n\n"
			)
			.format(this.FunctionName, this.StartLine,
				     this.SimpleCyclomaticComplexity, this.MaxNestingDepth,
			        this.MaxConditions,this.MaxMessageChains, this.ParameterCount, this.Returns)
		);
	}
};

// A builder for storing file level information.
function FileBuilder()
{
	this.FileName = "";
	// Number of strings in a file. - Workshop & HW2
	this.Strings = 0;
	// Number of imports in a file. - HW2
	this.ImportCount = 0;
	// Number of Comparison Operators >, <, >=, <= in the file - HW2
	this.AllComparisons = 0;

	this.report = function()
	{
		console.log (
			( "{0}\n" +
			  "~~~~~~~~~~~~\n" +
			  "ImportCount {1}\t" +
			  "Strings {2}\t" +
			  "AllComparisons {3}\t" +
			  "PackageComplexity {4}\n"
			).format( this.FileName, this.ImportCount, this.Strings, this.AllComparisons, this.ImportCount ));
	}
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
				child.parent = object;

				traverseWithParents(child, visitor);
            }
        }
    }
}

function complexity(filePath)
{
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);
	
	var i = 0;

	// A file level-builder:
	var fileBuilder 		= new FileBuilder();
	fileBuilder.FileName 	= filePath;
	fileBuilder.ImportCount = 0;

	builders[filePath] = fileBuilder;

	// Tranverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{

		// PackageComplexity: The number of imports used in file ( require("...") ) - HW2
		if (node.name === 'require' && node.type === 'Identifier') {
			fileBuilder.ImportCount += 1
		}
		
		// String Usage: How many string literals are used in file ? - Workshop and HW2
		if(node.type === 'Literal' && typeof(node.value) === 'string'){
			fileBuilder.Strings+=1
		}

		// AllComparisons: The total number of comparision operators - HW2
		if (isComparisonOperator(node)) {
			fileBuilder.AllComparisons += 1
		}


		if (node.type === 'FunctionDeclaration') 
		{
			var builder = new FunctionBuilder();

			builder.FunctionName 			= functionName(node);
			builder.StartLine    			= node.loc.start.line;

			// ParameterCount: The number of parameters for functions - Workshop and HW2
			builder.ParameterCount 			= node.params.length;

			max_member_expressions = 0
			max_of_decisions = 0
			traverseWithParents(node, function(child){
				
				if (isDecision(child)){
					// SimpleCyclomaticComplexity: The number of if statements / decision nodes / loops + 1 - Workshop and HW2
					builder.SimpleCyclomaticComplexity +=1
					
					// MaxConditions Builder
					condition_predicates = 0
					outerpredicates = 0
					traverseWithParents(child, function(child_of_child){

						if (isDecision(child_of_child)){
							outerpredicates = condition_predicates
							condition_predicates = 0
						}
						if (child_of_child.type === 'LogicalExpression'){
							condition_predicates +=1
						}
					});
					condition_predicates = Math.max(condition_predicates, outerpredicates)

					if (condition_predicates >= 0){
						max_of_decisions = Math.max(max_of_decisions, condition_predicates+1)
					}
					
				}

				if (child.type ==='MemberExpression'){
					max_chain = 0
					traverseWithParents(child, function(child_of_child){
						if (child_of_child.type === 'MemberExpression'){
							max_chain+=1
						}
					});
					max_member_expressions = Math.max(max_member_expressions, max_chain)
				}

				// Returns: The number of return statements in function - HW2
				if (child.type === 'ReturnStatement'){
					builder.Returns += 1
				}

				
			});
			builder.MaxMessageChains = max_member_expressions
			builder.MaxConditions = max_of_decisions;
			builder.SimpleCyclomaticComplexity += 1 // Adding a 1 to the number of if statements / decision nodes / loops - Workshop and HW2
			builders[builder.FunctionName] = builder;

		}
		
	});


}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}



// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function to check if node is a "decision node" that may contain a conditional predicate
function isConditionalDecision(node) {
	if (node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' || node.type == 'DoWhileStatement') {
		return true;
	}
	return false;
}

// Helper function for checking if node is a "comparison operator" (>, <, >=, <=) - HW2
function isComparisonOperator(node)
{
	if (node.operator === '>' || node.operator === '<' || node.operator === '>=' || node.operator === '<='){
		return true;
	}
	else return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();

function Crazy (argument) // 9 comparison operators
{

	var date_bits = element.value.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/);
	var new_date = null;
	if(date_bits && date_bits.length == 4 && parseInt(date_bits[2]) > 0 && parseInt(date_bits[3]) > 0)
    new_date = new Date(parseInt(date_bits[1]), parseInt(date_bits[2]) - 1, parseInt(date_bits[3]));

    var secs = bytes / 3500;

      if ( secs < 59 )
      {
          return secs.toString().split(".")[0] + " seconds";
      }
      else if ( secs > 59 && secs < 3600 )
      {
          var mints = secs / 60;
          var remainder = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var szmin;
          if ( mints > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          return mints.toString().split(".")[0] + " " + szmin + " " +
remainder.toString() + " seconds";
      }
      else
      {
          var mints = secs / 60;
          var hours = mints / 60;
          var remainders = parseInt(secs.toString().split(".")[0]) -
(parseInt(mints.toString().split(".")[0]) * 60);
          var remainderm = parseInt(mints.toString().split(".")[0]) -
(parseInt(hours.toString().split(".")[0]) * 60);
          var szmin;
          if ( remainderm > 1 )
          {
              szmin = "minutes";
          }
          else
          {
              szmin = "minute";
          }
          var szhr;
          if ( remainderm > 1 )
          {
              szhr = "hours";
          }
          else
          {
              szhr = "hour";
              for ( i = 0 ; i < cfield.value.length ; i++)
				  {
				    var n = cfield.value.substr(i,1);
				    if ( n != 'a' && n != 'b' && n != 'c' && n != 'd'
				      && n != 'e' && n != 'f' && n != 'g' && n != 'h'
				      && n != 'i' && n != 'j' && n != 'k' && n != 'l'
				      && n != 'm' && n != 'n' && n != 'o' && n != 'p'
				      && n != 'q' && n != 'r' && n != 's' && n != 't'
				      && n != 'u' && n != 'v' && n != 'w' && n != 'x'
				      && n != 'y' && n != 'z'
				      && n != 'A' && n != 'B' && n != 'C' && n != 'D'
				      && n != 'E' && n != 'F' && n != 'G' && n != 'H'
				      && n != 'I' && n != 'J' && n != 'K' && n != 'L'
				      && n != 'M' && n != 'N' &&  n != 'O' && n != 'P'
				      && n != 'Q' && n != 'R' && n != 'S' && n != 'T'
				      && n != 'U' && n != 'V' && n != 'W' && n != 'X'
				      && n != 'Y' && n != 'Z'
				      && n != '0' && n != '1' && n != '2' && n != '3'
				      && n != '4' && n != '5' && n != '6' && n != '7'
				      && n != '8' && n != '9'
				      && n != '_' && n != '@' && n != '-' && n != '.' )
				    {
				      window.alert("Only Alphanumeric are allowed.\nPlease re-enter the value.");
				      cfield.value = '⠀';
				      cfield.focus();
				    }
				    cfield.value =  cfield.value.toUpperCase();
				  }
				  return;
          }
          return hours.toString().split(".")[0] + " " + szhr + " " +
mints.toString().split(".")[0] + " " + szmin;
      }
  }
 exports.complexity = complexity;