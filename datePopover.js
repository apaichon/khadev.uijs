(function ( $ ) {
 
    $.fn.datePopOver = function(opts) {
			if(!opts){
				opts={};
			}
			this.opts = opts;
			var that =this;

			this.changeMonthYear =function(ddl){
				var $div = $(ddl).closest('div[class^="popover-content"]');
				var input =$div.find("input");
				var selMonth = $(ddl).val();
				var selYear = parseInt(input.val());
				//console.log(selYear);
				if(selYear == NaN){
					return that;
				}
				var locale =$(that.selector).attr('localeCode');
				//console.log(localeCode);
				that.loadDefaultLocales()
				.loadDefaultValues()
				;
				that.localeCode = locale;
				that.locale = that.getLocale(that.localeCode);
				console.log(that.locale);
				selYear -= that.locale.yearCompare;
				that.now = new Date(selYear,selMonth,1);

				that.thisMonth = that.now.getMonth()+1; 
	     		that.endWeek = that.thisMonth * that.totalWeek;
	     		that.startWeek = ((that.thisMonth  * that.totalWeek) - that.totalWeek)+1;
	     		//console.log(that.startWeek);
	     		that.firstDate = new Date(that.now.getFullYear(),that.now.getMonth(),1);
				
				that.firstDay = that.firstDate.getDay();

				that.getTemplate()
     			.loadCalendar()
     			.loadMonths()
     			.loadYear();

     			if($(that.selector).data('bs.popover')) {
   				 $(that.selector).data('bs.popover').options.content = that.$calendar;
				}
				$(that.selector).popover('show');

				$(that.selector).attr('localeCode',that.localeCode);
				return that;
			}

			this.getDate = function(){
				var dateVal =$(that.selector).val();
				var timeVal =$(that.selector).attr('timeVal');
				var dateFormat =$(that.selector).attr('dateFormat');
				var objDate = null;
				//console.log(dateVal,timeVal);
				
				if (dateVal.length == undefined&& timeVal.length == undefined )
					return objDate;
				
				if(dateFormat == undefined){
					return objDate;
				}

				if(dateVal.length == dateFormat.length){
					var dd =  dateVal.substr (dateFormat.indexOf('dd'),2);
					var MM =  dateVal.substr (dateFormat.indexOf('MM'),2);
					var yyyy =  dateVal.substr (dateFormat.indexOf('yyyy'),4);

					objDate = new Date(parseInt(yyyy) - that.locale.yearCompare,parseInt(MM)-1,parseInt(dd));
				}
				else if (timeVal){
					objDate = new Date(parseInt(timeVal));
				}
	
				return objDate;

			}
			
			this.setDate = function(timeVal){
				var date = new Date(timeVal);
				//var locale = that.getLocale(localeCode);
				//console.log(that.locale);
				var dateFormat = that.locale.format;
				var dd = date.getDate();
				var MM = date.getMonth()+1;
				var yyyy = date.getFullYear()+ that.locale.yearCompare;
				dateFormat =  dateFormat.replace('dd',(dd.toString().length==1?'0' + dd:dd));
				dateFormat =  dateFormat.replace('MM',(MM.toString().length==1?'0' + MM:MM));
				dateFormat =  dateFormat.replace('yyyy',yyyy);
				$(that.selector).val(dateFormat);
			}

			this.getLocale = function(localeCode){
				for(var i=0; i<that.locales.length;i++){
					if(that.locales[i].code === localeCode){
						return that.locales[i];
					}
				}
			}


			this.loadDefaultLocales = function(){
				that.locales=[{code:'en-US',yearCompare:0,
				dayShorts:['Sun','Mon','Tue','Wed' ,'Thu', 'Fri', 'Sat'],
				monthNames:['January','Febuary','March','April','May','June','July','August','September','October','November','December'],
				format:'MM/dd/yyyy'
				},
				{code:'th-TH',yearCompare:543,
				dayShorts:['อา','จ','อ','พ' ,'พฤ', 'ศ', 'ส'],
				monthNames:['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
				format:'dd/MM/yyyy'
				}];
				return that;
			}

			this.loadDefaultValues = function(){
				that.now = (that.opts.defaultDate === undefined || !that.opts.defaultDate instanceof Date?new Date():that.opts.defaultDate);
				that.totalWeek =(that.opts.totalWeek=== undefined || typeof(that.opts.totalWeek) !== 'number' ? 6:that.opts.totalWeek);
	     		that.thisMonth = that.now.getMonth()+1; 
	     		that.endWeek = that.thisMonth * that.totalWeek;
	     		that.startWeek = ((that.thisMonth  * that.totalWeek) - that.totalWeek)+1;
	     		that.firstDate = new Date(that.now.getFullYear(),that.now.getMonth(),1);
				that.firstDay = that.firstDate.getDay();
	     		that.localeCode = (that.opts.locale === undefined?that.locales[0].code:that.opts.locale );
	     		that.locale = that.getLocale(that.localeCode);
	     		$(that.selector).attr('localeCode', that.localeCode);
				return that;
			}

			
     		this.loadHeader = function(){				
				var locale = that.locale;
				
				var template ='<thead><tr><th colspan="7">';
				template +='<form class="form-inline">\
				  <div class="form-group" style="margin-left:5px">\
				    <select class="form-control" style="width:60%" onchange="datePopOver.changeMonthYear(this,\'{0}\')" >\
				  </div>\
				  <div class="form-group" >\
				    <input type="text" class="form-control" style="width:30%" maxlength="4"/>\
				  </div>\
				</form></th></tr>';
				template = template.replace('{0}',that.selector);

				template+='<tr>';
				locale.dayShorts.forEach(function(day){
					template+='<th>' + day+"</th>" ;
				});
				template+="</tr></thead>";
     			that.template = template;
     			return that;
     		}
			
     		this.loadDates = function(){
     			var j =0;
     			that.template +="<tbody><tr>"
     			
     			that.firstDate.setDate(-1*(that.firstDay));
     			for(var i =0 ; i<that.totalWeek *7 ;i++){
					if(i%7==0){
						j++;
						that.template +="</tr><tr>"
					}
					var aDay =new Date(that.firstDate.setDate(that.firstDate.getDate()+1));
					var sSelected =' onclick="datePopOver.selectedDate(this,\''+that.selector+'\',\'' +that.locale.format+'\',\''+that.locale.yearCompare+'\')"';
					if(aDay.getMonth()==that.now.getMonth()){
						that.template+='<td style="cursor:pointer">';
						//found today.
						var today = new Date();
						if(aDay.getDate() == today.getDate() && aDay.getMonth() == today.getMonth() ){
							that.template+='<span class="badge" timeVal="'+aDay.getTime() +'"' +sSelected+'>' + aDay.getDate() +"</span></td>" ;
						}
						else{
							that.template+='<span timeVal="'+aDay.getTime() +'"'+sSelected+'>' + aDay.getDate() +"</span></td>" ;
						}

					}
					else{
						that.template+='<td style="background:orange;cursor:pointer">';
						that.template+='<span timeVal="'+aDay.getTime() +'"'+sSelected+'>' + aDay.getDate() +"</span></td>" ;
					}
					
					//that.template+= '<a timeValue="'+ aDay.getTime() +'">'+aDay.getDate() + "</a></td>";
					//+ new Date(that.firstDate.setDate(that.firstDate.getDate()+1)).getDate() +"</td>";
				}
				that.template+="</tr></tbody>";
				//console.log(that.template);
				return that;
     		}

     		this.getTemplate = function(){
     			that.loadHeader()
     			.loadDates();
     			that.template ='<table class="table">'
     			+ that.template +'</table>';
     			return that;
     		}

     		this.loadMonths =function(){
     			//var locale = that.getLocale(that.localeCode);
     			var ddlMonths =that.$calendar.find('select');
     			//console.log(locale,ddlMonths);

     			$.each(that.locale.monthNames, function (i, item) {
				   var opt =$('<option>', { 
				        value: i,
				        text : item 
				    });
				    ddlMonths.append(opt);
				    if(that.now.getMonth()== i){
				    	opt.attr('selected','selected');
				    }
				   
				});



     			return that;
     		}

     		this.loadCalendar = function(){
     			that.$calendar =$(that.template);
     			return that;
     		}

     		this.loadYear = function(){
     			var inYear =that.$calendar.find('input');
     	
     			var sYear = that.now.getFullYear() + parseInt(that.locale.yearCompare);
     			inYear.attr('value', sYear);
				inYear.attr('onkeypress','return datePopOver.onlyInteger(event)');

     			return that;
     		}
			
     		this.loadPopOver = function(){
     			var $item =$(that.selector);
     			$item.attr('data-toggle','popover');
     			$item.attr('data-placement','bottom');
     			$item.popover({
		        html : true,
		        content: function() {
		          return that.$calendar.html();
		        }});
		        return that;
     		}

     		this.init = function(){
     			//console.log(that.selector);
     			//console.log('init');
     			that.loadDefaultLocales()
     			.loadDefaultValues()
     			.getTemplate()
     			.loadCalendar()
     			.loadPopOver()
     			.loadMonths()
     			.loadYear()
     			
     			;

		        return that;
     		}

     		if(!opts.changeMonthYear)
     		this.init();

     		return this;
    };
 
}( jQuery ));

var datePopOver ={
	onlyInteger:function(e){
		var key = window.event ? e.keyCode : e.which;
	    if (e.keyCode == 8 || e.keyCode == 46
	     || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 9) {
	        return true;
	    }
	    else if (key < 48 || key > 57) {
	        return false;
	    }
	    else return true;
	},
	selectedDate:function(item,selector,format,yearCompare){

		var $div = $(item).closest('div[class^="popover-content"]');
		$div.find("span").each(function(){
			if ($(this).hasClass( "label label-primary" ))
				$(this).removeClass("label label-primary");
		});
		$(item).addClass('label label-primary');

	 	var aDate =	new Date (parseInt( $(item).attr('timeVal')));
	 	//console.log(format);
	 	var sYear = aDate.getFullYear() + parseInt(yearCompare);
	 	var day =aDate.getDate();
	 	day =(day.toString().length<2?'0' +day:day);
	 	var month = aDate.getMonth()+1;
	 	month=(month.toString().length<2?'0'+month:month);
	 	var sDate = format
	 	.replace('dd',day)
	 	.replace('MM',month)
	 	.replace('yyyy', sYear);
	 	$(selector).val(sDate);
	 	$(selector).attr('timeVal',$(item).attr('timeVal'));
	 	$(selector).attr('dateFormat',format);
	 	$(selector).popover('hide');
	 	//$(selector).datePopOver().selectedDate = aDate;
	}
	,changeMonthYear:function(ddl,sel){
		
		var datePopOver =$(sel).datePopOver({changeMonthYear:true})
		.changeMonthYear(ddl);
		//console.log(datePopOver.getYear());
	}
}


