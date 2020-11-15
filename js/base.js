// --------- frequence images par seconde du rendu
	const ips = 25;
	
// --------- environ demi-longueur du modele, padding appliqué à W et H pour limiter la position sur les bords
	const padH = 50;

// --------- demi-hauteur du modele
	const padV = 40;

// --------- effectif maximum de la colonie
	const maxCo = 10;
	
// --------- variables globales
	var page;					// scène
	var out;					// affichage debug
	var W;						// largeur scène
	var H;						// hauteur scène
	var colonie = [];			// table des gendarmes
	var disponibles = [];		// table des gendarmes disponible
	var index = 0;				// matricule gendarme
	
// --------- fonction d'initialisation appelée au chargement body->onload
	function init() {
		// --------- désactive les ascenseurs de la fenêtre
		document.documentElement.style.overflow = 'hidden';  // firefox, chrome
		document.body.scroll = "no"; // ie only
		
		// --------- raccourcis vers elements fixes 
		page = document.getElementById("page");
		out = document.getElementById("output");
		
		// --------- largeur et hauteur de la fenêtre
		W = window.innerWidth;
		H = window.innerHeight;
		
		// --------- update W et H lors d'un resize de la fenêtre
		window.onresize = function() {
		    W = window.innerWidth;
		    H = window.innerHeight;
		}
		
		// --------- gestionnaire du click de souris (définition d'une cible pour un gendarme)
		document.onclick = function(e) {
		
		    // --------- récupération des coordonnées du click, en x et y
		    var x = e.pageX;
		    var y = e.pageY;
		    
		    var l = colonie.length;
		    var i = 0;
		    
		    disponibles = [];
		    for (i = 0; i < l; i++) {
		    	var o = colonie[i];
		    	if (o.mode == "auto") disponibles.push(o);		// sont déclarés dispos tous ceux en mode "auto"
		    }
		    l = disponibles.length;
		
		    for (i = 0; i < l; i++) {
		        var o = disponibles[i];
			// --------- verif du clic dans un carre de 50px autour de la pos de o        
				if ((Math.abs(o.posX - x) < 50) && (Math.abs(o.posY - y) < 50)) break; 
		    }
		    
		    // --------- si le click a eu lieu sur un individu, choix au hasard d'un autre pour le suivre
		    if (i < l) {
		        var a = disponibles[i].index;
		        disponibles.splice(i, 1);			// on sort le cliqué des dispos (la cible)
		    	l = disponibles.length;
		        var j = Math.floor(Math.random()*l);		// choix d'un autre parmi les dispos pour le suivre (le suiveur)
		        var b = disponibles[j].index;
		        disponibles.splice(j, 1);					// on sort le suiveur des dispos
		        poursuite(b,a);
		    }
		    
		    // --------- sinon (click sur la page) passage en mode "target" d'un indiv. au hasard
		    else {
		        l = disponibles.length;
		        // --------- correction de x et y sur les bords en fonction du padding défini (cf début de script)
		        if (x < padH) x = padH;
		    	if (x > W - padH) x = W - padH;
		    	if (y < padV) y = padV;
		    	if (y > H - padV) y = H - padV;
		    
		        // --------- tirage au sort d'un gendarme dans la colonie (non déja impliqué dans une poursuite !)
		    	i = Math.floor(Math.random()*l);
		    	var index = disponibles[i].index;
		    	disponibles.splice(i, 1);
		    	var o = colonie[index];
		
		    	// --------- affectation de la cible au gendarme
		    	o.targetX = x;
		    	o.targetY = y;
		    
		    	// --------- passage en mode "target"
		    	o.mode = "target";
		    
		    	// --------- retour en mode "auto" dans 4s
		    	var t = setTimeout(function() {
		            o.mode = "auto";
		    	}, 4000);
		    }
		}
	
		// --------- creation du div "cache" contenant les images
		createCache();
	
		// --------- lancement de la population
		populate();
//		debugFool();
	}
	
	function createCache() {
		var body = document.getElementsByTagName("body")[0];
		var page = document.getElementById("page");
		// --------- tables des objets img {class:"[className]",src:"iamges/[fileName].png"}
		var a = [{c:"p_0",s:"p_0_0"},{c:"p_1",s:"p_0_0"},{c:"p_2",s:"p_2_0"},{c:"p_3",s:"p_2_0"},{c:"p_4",s:"p_4_0"},{c:"p_5",s:"p_4_0"},{c:"a_0",s:"ant_0"},{c:"a_1",s:"ant_0"},{c:"tronc",s:"tronc"}];
		var b = [{c:"tronc",s:"tronc_gj"},{s:"p_0_1"},{s:"p_0_2"},{s:"p_0_3"},{s:"p_0_4"},{s:"p_0_5"},{s:"p_2_1"},{s:"p_2_2"},{s:"p_2_3"},{s:"p_2_4"},{s:"p_2_5"},{s:"p_4_1"},{s:"p_4_2"},{s:"p_4_3"},{s:"p_4_4"},{s:"p_4_5"},{s:"ant_1"},{s:"ant_2"},{s:"ant_3"},{s:"ant_4"},{s:"ant_5"},{s:"ant_6"},{s:"ant_7"},{s:"ant_8"}];
		var cache = document.createElement("div");
		body.insertBefore(cache,page);
		cache.setAttribute("id","cache")
		var corps = document.createElement("div");
		corps.classList.add("corps");
		cache.appendChild(corps);
		var i;
		for (i=0;i<a.length;i++) addImage(corps,a[i]);
		for (i=0;i<b.length;i++) addImage(cache,b[i]);	
	}
	
	// -------- fonction d'ajout d'une image à un element HTML, appelée depuis createCache
	function addImage(element,imgObj) {
		var img = document.createElement("img");
		img.src = "images/"+imgObj.s+".png";
		if (imgObj.c) img.classList.add(imgObj.c);
		element.appendChild(img);
	}
	// --------- (zero Plus ou Moins) fonction qui retourne -1, 0 ou 1; utilisée pour faire varier aléatoirement des valeurs
	function zPM() {		
	    return Math.floor(Math.random()*3) - 1;	
	}
	
	// -------- (Plus ou Moins) idem retourne -1 ou 1
	function PM() {
	    return (((Math.floor(Math.random()*2)) * 4) - 2) / 2;
	}
	
	// --------- fonction constructeur de l'objet Gendarme
	function Gendarme(id) {
	    
	    this.index = id;
	    this.cible = 0;
	
	    // --------- association du corps avec son image html via le noeud enfant "id" du div page
	    this.corps = document.getElementById("page").children[id];
	 	this.corps.style.zIndex = id;
	    // --------- association des éléments du corps (6 pattes, 2 antennes et le tronc) avec leur image via noeuds enfants du corps
	    var parts = this.corps.children;
	    this.pat_0 = parts[0];
	    this.pat_1 = parts[1];
	    this.pat_2 = parts[2];
	    this.pat_3 = parts[3];
	    this.pat_4 = parts[4];
	    this.pat_5 = parts[5];
	    this.ant_0 = parts[6];
	    this.ant_1 = parts[7];
	    this.tronc = parts[8];
	
	
	    // --------- coordonnées en x et y du gendarme
	    this.posX = 0;
	    this.posY = 0;
	
	    // --------- coordonnées en x et y de la cible de déplacement
	    this.targetX = 0;
	    this.targetY = 0;
	
	    // --------- mode de déplacement parmi ["entre", "auto", "stop", "target", "suivi", "swap", "pris", "sort"], initialisation en "stop"
	    this.mode = "stop";
	
	    // --------- variable de déplacement: accélération, vitesse, vitesse maximale (à priori 15) et cap (en radian)
	    this.acc = 0;
	    this.vit = 0;
	    this.vMax = 15;
	    this.cap = 0;
	    this.dCap = 0;
	    this.compteur = 0;
	
	    // --------- table des n° d'image pour chaque patte (Rmq: n° compris entre 0 et 5, pour chacune des pattes)
	    this.patFrame = [0, 0, 0, 0, 0, 0];
	
	    // --------- table des n° d'image pour chaque antenne (Rmq: n° compris entre 0 et 8 pour chacune des antennes)
	    this.antFrame = [0, 0];
	
	    // --------- fonction d'initialisation du gendarme
	    this.start = function() {
	
		// --------- positionnement aléatoire à l'extérieur de la fenêtre
	    	this.posX = W/2 + PM()*(W/2 + padH);
	    	this.posY = H/2 + PM()*(H/2 + padH);
	
		// --------- définition aléatoire d'une cible à l'intérieur de la fenêtre, puis d'un delai pour activation
	    	faitEntrer(this, 1500);
	
		// --------- lancement des fonction "de base"
	        gereAcceleration(this);
	        gereToc(this);
	        gereAnt(this);
	        move(this);
	    }
	    
	    // --------- lancement du gendarme dès sa création
	    this.start();
	}
	function debugFool() {
		var txt = "";
		for(var i=0;i<colonie.length;i++) {
			var o = colonie[i];
			txt += o.index + " " + o.mode + " " + o.compteur + " z= " + o.corps.style.zIndex+"<br/>";
		}
//		out.innerHTML = txt;
		var t = setTimeout(debugFool, 40);
	}
	function faitEntrer(o, msec) {
		resetMode(o);
		o.targetX = W/2 + zPM() * Math.random() * W/4;
		o.targetY = H/2 + zPM() * Math.random() * H/4;
		o.mode = "entre";
		var t = setTimeout( function() { o.mode = "auto"; }, msec);
	}
	function resetMode(o) {
		o.acc = 0;
		o.vit = 0;
		o.compteur = 0
		o.corps.style.zIndex = o.index;		// on remet le z-index d'origine (cas d'un retour de coït)
		gereAcceleration(o);
	}
	// --------- fonction de duplication des gendarmes (et de lancement global du programme)
	function populate() {
	
	    // ---------- si effectif n'est pas maximum
	    if (colonie.length < maxCo) {
	    
	        // --------- recuperation du modele html
	        var modele = document.getElementById("cache").children[0];
	    
	    	// --------- clonage du modele et insertion dans la page 
	    	var clone = modele.cloneNode(true);
	    	page.appendChild(clone);
	    
	    	// --------- ajout du nouveau Gendarme dans la colonie
	    	var nouveau = new Gendarme(index);
	    	colonie.push(nouveau);
	    
	        // --------- incrémentation du matricule
	        index ++;
	    }
	    
	    // --------- répétition selon timing +/- aléatoire
	    var t = setTimeout(populate, 2000 + Math.random()*3000);
	}
	
	function poursuite(a, b) {
	    var suiveur = colonie[a];
	    var cible = colonie[b];
	    suiveur.mode = "target";
	    cible.mode = "suivi";
	    
	    if (suiveur.index < cible.index) {		// croisement du z-index 
	    	suiveur.corps.style.zIndex = cible.index;
	    	cible.corps.style.zIndex = suiveur.index;
	    }
	    suiveur.targetX = cible.posX - Math.cos(cible.cap) * padH;
	    suiveur.targetY = cible.posY - Math.sin(cible.cap) * padH;
	            var dX = cible.posX - suiveur.posX;
	            var dY = cible.posY - suiveur.posY;
	        
	            // --------- ce bon vieux Pyth !!
	            var d = Math.sqrt(dX*dX + dY*dY);
	    if ((suiveur.vit == 0) && (d < (2 * padH + 10))) suiveur.compteur ++;		// quand le suiveur colle à la cible, le compteur s'incrémente
	    if (suiveur.compteur > 50) {					// quand le compteur atteint 50 --> accouplement! 
	        accouple(a, b);
	        return;
	    }
	    var t = setTimeout(poursuite, 1000/ips, a, b);
	}
	
	function accouple(a, b) {
	    var suiveur = colonie[a];
	    suiveur.cible = b;
	    var cible = colonie[b];
	    cible.mode = "pris";		// no comment...
	    suiveur.mode = "swap";		// doit se retourner 
	}
	
	
	// --------- gestion de l'acceleration (en mode "auto" seulement); prends aléatoirement la valeur -acc, 0 ou +acc (cf propriété acc dans fonction Gendarme)
	function gereAcceleration(o) {
	    switch (o.mode) {
	        case "stop" :
	        case "swap" :
	            o.acc = 0;
	            var t = setTimeout(gereAcceleration, 1000/ips, o);
	            break;
	        
	        case "sort" :
	        	o.acc = 1;
	        	break;
	        	   
	        default :
	           o.acc = zPM();
	           var t = setTimeout(gereAcceleration, 250 + Math.random()*2000, o);
	    }
	}
	
	// --------- fonction visant à animer aléatoirement une patte quand le gendarme est à l'arrêt (sorte de Trouble Obsessionnel Compulsif)
	function gereToc(o) {
	    if (o.vit < 1) {
	    
	    	// --------- choix d'une patte au hasard parmi les 6
	    	var n = Math.floor(Math.random()*o.patFrame.length);
	    
	    	// --------- affectation à cette patte d'une image au hasard parmi les 6 disponibles
	    	o.patFrame[n] = Math.floor(Math.random()*6);
	    }
	    var delay;
	    switch (o.mode) {
	    	case "pris" :
	    	case "swap" :
	    		delay = 50 + Math.random()*750;		// fréquence toc X 2 par rappoort à normal
	    		break;
	    		
	    	default : 
	    		delay = 100 + Math.random()*1500;
	    }	    	
	    var t = setTimeout(gereToc, delay, o);
	}
	
	// --------- fonction visant à animer alternativement les antennes, en fonction de l'allure
	function gereAnt(o) {
	
	    // --------- choix d'une antenne au hasard parmi les 2
	    var n = Math.floor(Math.random()*2);
	
	    // --------- si le gandarme est à l'arrêt, affectation au hasard d'une image antenne parmi les 5 premières images
	    if (o.vit < 1) {
	    	o.antFrame[n] = Math.floor(Math.random()*5);
	
	    // --------- sinon une image au hasard parmi les 4 suivantes
	    } else {
	    	o.antFrame[n] = Math.floor(Math.random()*4) + 5;
	    }
	    var delay;
	    switch (o.mode) {
	    	case "pris" :
	    	case "swap" :
	    		delay = 25 + Math.random()*100;
	    		break;
	    		
	    	default :
	    		delay = 50 + Math.random()*500;
	    }
	    var t = setTimeout(gereAnt, delay, o);
	}
	
	// --------- gestion du déplacement
	function move(o) {
	
	    // --------- gestion du cap de déplacement
	    calculeCap(o);
	
	    // --------- gestion de la vitesse
	    calculeVitesse(o);
	
	    // --------- gestion de la position
	    calculePosition(o);

		// --------- gestion des collisions
//		gereCollision(o);
	
	    // --------- correction en fonction des limites de bords
	    limitePosition(o);
	    
	    // --------- determine l'image de chaque patte 
	    gerePattes(o);
	
	    // --------- rendu graphique
	    dessine(o);
	
	    var t = setTimeout(move, 1000/ips, o); 
	}
	
	
	function calculeCap(o) {
	
	    var cible = colonie[o.cible];
	    
	    switch (o.mode) {
		
			case "coit" :
				var angle = (cible.cap + Math.PI) % (Math.PI * 2);		// devra s'orienter à l'opposé de la cible
				var dCap = Math.PI/18;					// pas d'angle par défaut
			    if (cible.vit == 0) return;

			    if (Math.abs(angle - o.cap) < Math.PI/8) {		// si l'écart entre l'angle visé et l'angle actuel est < 20°, prend les ecarts d'angle dCap opposés de la cible
			    	dCap = -cible.dCap;
			    	o.cap += dCap;
			    }
				else {							// sinon se rapproche de dCap dans le bon sens de l'angle visé 
				    if (angle > o.cap) {
				        if (angle - o.cap > Math.PI) o.cap -= dCap;
				        else o.cap += dCap;
				    } else {
				        if (o.cap - angle > Math.PI) o.cap += dCap;
				        else o.cap -= dCap;
				    }
				}
			    break;

		// --------- mode retournement, les deux se rapprochent de l'axe moyen 
			case "swap" :
	            var angle = (cible.cap + 2 * Math.PI) % (2 * Math.PI);
	            o.cap = (o.cap + 2 * Math.PI) % (2 * Math.PI);
	            var dCap = zPM() * Math.PI/36;
	            if (Math.abs(angle - o.cap) < Math.PI/36) dCap = zPM() * Math.PI/72;
	            var sens;
	            dCap += (angle - o.cap)/10;
	            if (Math.abs(angle > o.cap) > Math.PI) sens = -1;
	            else sens = 1;
				o.cap += dCap * sens;
	    	    break;
	
		// --------- en mode "entre" ou "target", si vitesse >= 3, le cap est dicté par la cible (target) et ne peut varier que par +10° ou -10°, de façon à avoir des changements de trajectoire curvilignes
	        case "entre" :
	        case "target" :
			    if (o.vit < 3) return;
	    	
	    	    // --------- dCap variation de 10°
	            var dCap = Math.PI/18;
	        
	            // --------- calcul de l'angle séparant le cap et la cible
	    	    var dX = o.targetX - o.posX;
	    	    var dY = o.targetY - o.posY;
	    	
	    	    // --------- pas de division par 0 !!!
	    	    if (dX == 0) dX = 1;
	    	
	    	    // --------- fonction arc tangente pour obtenir l'angle cible
	    	    var angle = Math.atan(dY / dX);
	    	
	    	    // --------- en JavaScript atan() ne retourne qu'une valeur comprise entre -PI/2 et PI/2, donc adaptation avec ajout de PI dans le cas ou dX < 0
	    	    if (dX < 0) angle += Math.PI;
	    	
	    	    // --------- on ramène angle à une valeur comprise entre 0 et 2PI
	    	    if (angle < 0) angle = Math.PI*2 + angle;
	    	
	    	    // --------- si le cap se rapproche de l'angle cible, on réduit dCap à 2,5°, pour adoucir la courbe de fin de trajectoire
	    	    if (Math.abs(angle - o.cap) < Math.PI/36) dCap = Math.PI/72;
	    	
	    	    // --------- affectation de +dCap (sens horaire) ou -dCap (sens opposé) en fonction du plus proche
	    	    if (angle > o.cap) {
	    	        if (angle - o.cap > Math.PI) o.cap -= dCap;
	    	        else o.cap += dCap;
	    	    } else {
	    	        if (o.cap - angle > Math.PI) o.cap += dCap;
	    	        else o.cap -= dCap;
	    	    }
	    	    break;
	
		// --------- 	 
			case "pris" :
	            if (o.vit < 1) {
	                o.dCap = 0;
	                return;
	            }
	
	            // --------- dCap variation de sPM 2,5°
			    o.dCap = zPM() * Math.PI/72;
			    
		        o.cap += o.dCap;
			    break
	
	        // --------- en mode "auto", si vitesse >= à 1, le cap varie aléatoirement de -5°, 0 ou +5°, par soucis de réalisme existentiel !
			default :
		        if (o.vit < 1) {
		            o.dCap = 0;
		            return;
		        }
		
		        // --------- dCap variation de zPM 5°
		        o.dCap = zPM() * Math.PI/36;
		    
		        o.cap += o.dCap;
	    }
	    
	    // --------- limitation du cap à une valeur comprise entre 0 et 2 PI
	    o.cap = (o.cap + 2 * Math.PI) % (2 * Math.PI);
	    
	}
	
	// --------- calcul de la vitesse (càd progression du déplacement entre deux affichages)
	function calculeVitesse(o) {
	
	    var vLim = o.vMax;
	
	    switch (o.mode) {
	
	        // --------- en mode "entre" ou "target", la vitesse est une fraction (1/10) de la distance avec la cible
	        case "entre" :
	        case "target" :
	            var dX = o.targetX - o.posX;
	            var dY = o.targetY - o.posY;
	        
	            // --------- ce bon vieux Pyth !!
	            var d = Math.sqrt(dX*dX + dY*dY);
	            o.vit = d/10;
	            if (o.vit < 4) o.vit = 0;	// sinon furieux effet de glissement
	            break;
	
			case "swap" :
			    o.vit = 6;
			    break;

			case "stop" :
			case "pris" :
			    o.vit = 0;
			    break;
		
			case "coit" : 		// la position de coït est déterminé par celle de sa cible (donc vit = 0)
			    o.vit = 0;
			    break;
			    
			case "suivi" :		// pour être rattrappé plus facilement
	            vLim *= 0.8;
	    		o.vit += o.acc;
	            break;
			
			case "sort" : 
				vLim = o.vMax * 0.5;		// tranquilo Pablo...
	    		o.vit += o.acc;
				break;
				
			default :
	            o.vit += o.acc;
	    }
	
	    // --------- limitation de la vitesse, de toute façon...
	    if (o.vit > vLim) o.vit = vLim;
	    
	    // --------- pour eviter l'effet de glissement	    
	    if (o.vit < 1) {
	    	o.vit = 0;
	    }

	}
	
	// --------- affectation du positionnement en x et y, en fonction de la vitesse et du cap
	function calculePosition(o) {
	    var cible = colonie[o.cible];
	    o.corps.style.transform = "scale(1,1)";
	    switch (o.mode) {
	        case "coit" :     		// en mode coït le G reste collé à sa cible    
		        o.posX = cible.posX + padH * (Math.cos(o.cap) - Math.cos(cible.cap));
		        o.posY = cible.posY + padH * (Math.sin(o.cap) - Math.sin(cible.cap));
		        break;
	
			case "swap" :			// en mode "swap", on s'approche par palier (1/20) de la pos de la cible faisant fi de acc et vit, puis on passe en mode "coït" et la cible en mode "sort"
			    var X = cible.posX;
		    	var Y = cible.posY;
			    o.posX += (X - o.posX)/20;
			    o.posY += (Y - o.posY)/20;
			    if ((Math.abs(X - o.posX) < 4) && (Math.abs(Y - o.posY) < 4)) {			// si à moins de 4px, passe au mode suivant
			        o.posX = X;
			        o.posY = Y;
			        cible.mode = "sort";
			        o.mode = "coit";
			    }
			    break;
		    
			default :	
		        o.posX += o.vit * Math.cos(o.cap);
		        o.posY += o.vit * Math.sin(o.cap);
	    }
	}
	

	// --------- gestion des limites de la fenêtre, et des demi-tour !!
	function limitePosition(o) {
	    switch (o.mode) {
	    
			// --------- particularité du mode "entre": pas de limite puisqu'on la franchit pour entrer ! idem pour "swap" et "pris" dans le but de faciliter le coït
	        case "entre" :
	        case "swap" :
	        case "pris" :
	        case "sorti" :
	            return;
	            
			// --------- on laisse sortie les couples formés
	        case "coit" :
	        case "sort" :
	        
	            // ---------- verification de la sortie de la fenêtre (avec def d'une marge)
	            var marge = padH * 1;
	            if (((o.posX < -marge) || (o.posX > W + marge)) && ((o.posY < -marge) || (o.posY > H + marge))) {
	            	o.mode =  "sorti";
	
				// ----------- si sorti, le gendarme rentre à nouveau
	            	faitEntrer(o, 3000);
	            }
	            return;
	
	        default :
	        	var lim = { h: padH, d: W - padH, b: H - padH, g: padH };

	            // --------- définition d'une variation de cap aléatoirement égale à 2,5°, 5°, 7,5° ou 10° pour effectuer les 1/2 tour
	            var dCap = (Math.floor(Math.random()*4) + 1) * Math.PI/72;
	    
	    	    // --------- détermination du sens (horaire ou opposé) en fonction du cap actuel et du bord rencontré; réajustement de la position à l'intérieur de la fenêtre, mise à l'arrêt
	    	    var sens = 0;
	    	    if ((o.posX > lim.d) && (o.posY < lim.h)) {
	                o.posX = lim.d;
	                o.posY = lim.h;
	                o.vit = 0;
	                sens = -1;
	            }
	    	    if ((o.posX > lim.d) && (o.posY >= lim.h)) {
	                o.posX = lim.d;
	                o.vit = 0;
	                if (((o.cap > 0) && (o.cap > 3*Math.PI/2)) || ((o.cap < 0) && (o.cap > -Math.PI/2))) sens = -1;
	                else sens = 1;
	            }
	            
	    	    if (o.posX < lim.g) {
	                o.posX = lim.g;
	                o.vit = 0;
	                if (((o.cap < 0) && (o.cap < -Math.PI)) || ((o.cap > 0) && (o.cap < Math.PI))) sens = -1;
	                else sens = 1;
	            }
	            if (o.posY > lim.b) {
	                o.posY = lim.b;
	                o.vit = 0;
	                if (((o.cap > 0) && (o.cap < Math.PI/2)) || ((o.cap < 0) && (o.cap < -3*Math.PI/2))) sens = -1;
	                else sens = 1;
	            } 
	            if ((o.posY < lim.h) && (o.posX <= lim.d)) {
	                o.posY = lim.h;
	                o.vit = 0;
	                if (((o.cap > 0) && (o.cap < 3 * Math.PI/2)) || ((o.cap < 0) && (o.cap < -Math.PI/2))) sens = -1;
	                else sens = 1;
	            }
	    }
	    
	    // --------- affectation de dCap en fonction du sens
	    o.dCap = sens * dCap;
	    o.cap += o.dCap;
	    
	    // --------- affectation de l'image des pattes en fonction du sens de rotation
	    o.patFrame[0] += sens;
	    o.patFrame[1] -= sens;
	    o.patFrame[2] += sens;
	    o.patFrame[3] -= sens;
	    o.patFrame[4] += sens;
	    o.patFrame[5] -= sens;
	}
	
	// --------- gere l'image de chaque patte
	function gerePattes(o) {
	    var cible = colonie[o.cible];
	    
	    switch (o.mode) {
	    
	        case "coit" :
	            var vit = cible.vit;
	            var dV = -1 * Math.round(vit/8);
	    	    for (var i = 0; i < o.patFrame.length; i++) {
	            	if (cible.vit > .9) {
	                    o.patFrame[i] += dV;
	            	}
	            }      
	            break;
	        
	        default : 
		   	    var vit = o.vit;
			    var dV = Math.round(vit/8);
			    for (var i = 0; i < o.patFrame.length; i++) {
		        	if (o.vit > .9) {
		                o.patFrame[i] += dV;
		        	}
		        	else if (o.vit > 0) o.patFrame[i] += 1;
		        }      
	    }
	    for (var i = 0; i < o.patFrame.length; i++) {
	        // --------- ajout de 12 pour éviter valeur de n < 0 (cas des 1/2 tour et du mode "coit")
	        o.patFrame[i] += 12;
	        
	        // --------- le n° d'image est le reste de la division par 6
	        o.patFrame[i] %= 6;
	    }
	}
	
	
	// --------- dessine les gendarmes en html et css
	function dessine(o) {
	
	    // --------- conversion du cap de radian en degré application du style transform rotate au corps
	    var deg = o.cap*180/Math.PI;
	    o.corps.style.transform = "rotate("+deg+"deg)";
	    
	    // --------- ajout d'un tremblement de 0 ou +/- 1° au tronc par soucis de réalisme
	    var degT = (zPM() * Math.PI/360) * 180/Math.PI;
	    o.tronc.style.transform = "rotate("+degT+"deg)";
	    
	    // --------- affectation de la nouvelle position en x,y du corps dans la fenêtre
	    o.corps.style.left = o.posX + "px";
	    o.corps.style.top = o.posY + "px";
	    
	    // --------- léger soulèvement du corps quand vitesse > 3
	    if (o.vit > 3) o.tronc.style.transform = "scale(1,1.1)";
	    else o.tronc.style.transform = "scale(1,1)";
	    // --------- léger soulèvement du corps en mode swap
		if (o.mode == "swap") o.tronc.style.transform = "scale(1.05,1.15)";
		else o.tronc.style.transform = "scale(1,1)";

	    // --------- affectatipon de l'image des pattes 
	    o.pat_0.src = "images/p_0_" + o.patFrame[0] + ".png";
	    o.pat_1.src = "images/p_0_" + o.patFrame[1] + ".png";
	    o.pat_2.src = "images/p_2_" + o.patFrame[2] + ".png";
	    o.pat_3.src = "images/p_2_" + o.patFrame[3] + ".png";
	    o.pat_4.src = "images/p_4_" + o.patFrame[4] + ".png";
	    o.pat_5.src = "images/p_4_" + o.patFrame[5] + ".png";
	    o.ant_0.src = "images/ant_" + o.antFrame[0] + ".png";
	    o.ant_1.src = "images/ant_" + o.antFrame[1] + ".png";
	}
	
	// --------- création d'une trace (non utilisée)
	function trace(o) {
	    var pix = document.getElementById("extra").children[0];
	    var copy = pix.cloneNode(true);
	    copy.style.left = o.posX + "px";
	    copy.style.top = o.posY + "px";
	    page.appendChild(copy);
	}
