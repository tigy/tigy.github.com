Demo.writeQuestions = function(questions) {

	var i = 1;
	Demo.writeQuestions.answers = [''];
	document.write('<article id="demo-questions">');
	for(var question in questions) {
		var answers = questions[question];
		document.write('<section class="demo demo-tip" id="demo-questions-qd');
		document.write(i);
		document.write('">\r\n');
		document.write('<h4 class="demo-plain">\r\n');
		document.write(i);
		document.write('. ');
		document.write(Demo.encodeHTML(question));
		document.write('\r\n</h4>\r\n');
		document.write('<menu>\r\n');

		for(var j = 0; j < answers.length; j++) {
			if(answers[j].charAt(0) === '@') {
				Demo.writeQuestions.answers[i] = j;
				answers[j] = answers[j].substr(1);
			}

			document.write('<input type="radio" name="demo-questions-q');
			document.write(i);
			document.write('" id="demo-questions-q');
			document.write(i);
			document.write(j);
			document.write('"><label for="demo-questions-q');
			document.write(i);
			document.write(j);
			document.write('">');
			document.write(Demo.encodeHTML(answers[j]));
			document.write('</label><br>\r\n');
		}
		document.write('\r\n</menu>\r\n');
		document.write('\r\n</section>\r\n');
		i++;

	}

	document.write('<input type="button" onclick="Demo.checkAnswers()" value="验证">');
	document.write('<div id="demo-questions-info"></div>');
	document.write('</article>');
};

Demo.checkAnswers = function() {
	var errorCount = 0, total = Demo.writeQuestions.answers.length - 1;
	for(var i = 1; i <= total; i++) {
		if(Demo.writeQuestions.answers[i] === undefined)
			continue;
		var qd = document.getElementById('demo-questions-qd' + i);
		if(!document.getElementById('demo-questions-q' + i + Demo.writeQuestions.answers[i]).checked) {
			var allButtons = document.getElementsByName('demo-questions-q' + i);
			errorCount++;
			qd.className = 'demo demo-tip demo-tip-warning';
			for(var j = 0; allButtons[j]; j++) {
				if(allButtons[j].checked) {
					qd.className = 'demo demo-tip demo-tip-error';
					break;
				}
			}
		} else {
			qd.className = 'demo demo-tip';
		}
	}

	var r = (total - errorCount) * 100 / total, className;

	if(r == 100) {
		innerHTML = '全对了!';
		className = 'demo-tip demo-tip-success';
	} else if(r > 60) {
		innerHTML = '';
		className = 'demo-tip demo-tip-warning';
	} else {
		innerHTML = r == 0 ? '没有一题是正确的...你在干吗?' : '不及格哦亲';
		className = 'demo-tip demo-tip-error';
	}

	var t = document.getElementById('demo-questions-info');

	t.innerHTML = '答对' + (total - errorCount) + '/' + total + '题(' + r + '%) ' + innerHTML;
	t.className = className;

};
