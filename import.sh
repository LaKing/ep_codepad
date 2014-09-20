    ## import source files.
    APIKEY=$(cat /srv/etherpad-lite/APIKEY.txt)
    createpad_url='http://127.0.0.1:9001/api/1/createPad'

    function createpad {
    f=$1
	echo ".. adding $f"
	#filepath=$(echo ${f:2} | sed 's|/|___|g')
	curl -d "apikey=$APIKEY" --data-urlencode "padID=${f:2}" --data-urlencode "text=$(cat $f)"  $createpad_url
	echo ''
    }

    ## cd $project_path

        for f in $(find .)
        do
        # take action on each file. $f store current file name
         if [ -e $f ] 
         then

         ## Process file depending on extension


	if [[ $f == *.json ]]
	 then
	    createpad $f
	 fi

	if [[ $f == *.md ]]
	 then
	    createpad $f
	 fi


	if [[ $f == *.txt ]]
	 then
	    createpad $f
	 fi

	if [[ $f == *.js ]]
	 then
	    createpad $f
	 fi

	if [[ $f == *.rb ]]
	 then
	    createpad $f
	 fi

	if [[ $f == *.html ]]
	 then
	    createpad $f
	 fi

	if [[ $f == *.css ]]
	 then
	    createpad $f
	 fi

	if [[ $f == *.php ]]
	 then
	    createpad $f
	 fi
        fi
        done
