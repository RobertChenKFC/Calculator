let inputBox;
let errorDiv;
let formulaDiv;
let resultDiv;
let approxDiv;
let formula;

function setup() {
	inputBox = select("#input");

	errorDiv = select("#error");
	
	MathJax.Hub.queue.Push(() => {
		formulaDiv = MathJax.Hub.getAllJax("formula")[0];
	});

	MathJax.Hub.queue.Push(() => {
		resultDiv = MathJax.Hub.getAllJax("result")[0];
	});

	MathJax.Hub.queue.Push(() => {
		approxDiv = MathJax.Hub.getAllJax("approx")[0];
	});

	formula = new Formula();
	
	inputBox.input(() => {
		try {
			formula.setFormula(inputBox.value());

			const formulaStr = formula.getLatex();
			MathJax.Hub.queue.Push(["Text", formulaDiv, formulaStr]);	

			const resultFrac = formula.getValue();
			const resultStr = resultFrac.toLatex();
			MathJax.Hub.queue.Push(["Text", resultDiv, resultStr]);

			const approxStr = resultFrac.getApprox().toString(); 
			MathJax.Hub.queue.Push(["Text", approxDiv, approxStr]);

			errorDiv.html("Nothing");	
		}
		catch(e) {
			errorDiv.html(e);
		}
	});
}

